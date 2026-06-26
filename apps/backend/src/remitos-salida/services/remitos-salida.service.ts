import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../../stock/services/stock.service';
import { FaltantesObraService } from '../../faltantes-obra/services/faltantes-obra.service';
import { RemitosSalidaRepository, CreateRemitoData } from '../repositories/remitos-salida.repository';
import { RemitoNumeradorService } from './remito-numerador.service';
import { RemitoExcelService, RemitoExcelData } from './remito-excel.service';
import { CreateRemitoDto } from '../dto/create-remito.dto';
import { ItemRemitoDto } from '../dto/item-remito.dto';

const BACKOFFS_MS = [30_000, 120_000, 600_000] as const;

const CATEGORIAS_CONVERSION = new Set(['CANO_CLOACA', 'CANO_GAS', 'CANO_ELECTRICO']);

interface ItemCalculado {
  materialId: string;
  descripcion: string;
  cantidadPedida: number;
  unidad: string;
  cantidadEnStock: number;
  cantidadFaltante: number;
  condicionEntrega: string;
  observaciones?: string;
}

@Injectable()
export class RemitosSalidaService {
  private readonly logger = new Logger(RemitosSalidaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: RemitosSalidaRepository,
    private readonly numerador: RemitoNumeradorService,
    private readonly excelService: RemitoExcelService,
    private readonly stockService: StockService,
    private readonly faltantesService: FaltantesObraService,
  ) {}

  findAll(filtros?: { obraId?: string; fechaDesde?: string; fechaHasta?: string }) {
    return this.repository.findAll(filtros);
  }

  async findById(id: string) {
    const remito = await this.repository.findById(id);
    if (!remito) throw new NotFoundException('PEDIDO_NOT_FOUND');
    return remito;
  }

  async create(dto: CreateRemitoDto) {
    // 1. Validar pedido
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      include: { obra: true },
    });
    if (!pedido) throw new NotFoundException('PEDIDO_NOT_FOUND');
    if (pedido.estado !== 'CONFIRMADO') throw new UnprocessableEntityException('PEDIDO_NO_CONFIRMADO');

    const remitoExistente = await this.prisma.remitoSalida.findUnique({ where: { pedidoId: dto.pedidoId } });
    if (remitoExistente) throw new UnprocessableEntityException('PEDIDO_YA_TIENE_REMITO');

    // 2. Número correlativo
    const numeroRemito = await this.numerador.siguiente();
    const numeroRemitoStr = this.numerador.formatear(numeroRemito);

    // 3. Calcular ítems (conversión de unidades + stock actual)
    const proveedor = await this.obtenerProveedor(pedido.obraId);
    const itemsCalculados = await this.calcularItems(dto.items, pedido.obraId, proveedor);

    // 4. Generar Excel
    const fechaRetiro = new Date(dto.fechaRetiroDeposito);
    const excelData: RemitoExcelData = {
      obraNombre: pedido.obra.nombre,
      numeroRemitoStr,
      solicitante: pedido.solicitante,
      encargadoDeposito: dto.encargadoDeposito,
      encargadoTraslado: dto.encargadoTraslado,
      fechaPedidoObra: pedido.fechaPedido.toLocaleDateString('es-AR'),
      fechaRetiroDeposito: fechaRetiro.toLocaleDateString('es-AR'),
      items: itemsCalculados,
    };
    const excelBuffer = await this.excelService.generar(excelData);

    // 5. Guardar archivo
    const archivoExcel = await this.guardarExcel(excelBuffer, fechaRetiro, numeroRemito);

    // 6. Persistir en DB
    const createData: CreateRemitoData = {
      pedidoId: dto.pedidoId,
      obraId: pedido.obraId,
      numeroRemito,
      solicitante: pedido.solicitante,
      encargadoDeposito: dto.encargadoDeposito,
      encargadoTraslado: dto.encargadoTraslado,
      fechaPedidoObra: pedido.fechaPedido,
      fechaRetiroDeposito: fechaRetiro,
      archivoExcel,
      items: itemsCalculados,
    };
    const remito = await this.repository.create(createData);

    // 7. Marcar pedido como REMITO_GENERADO
    await this.prisma.pedido.update({
      where: { id: dto.pedidoId },
      data: { estado: 'REMITO_GENERADO' as any },
    });

    // 8. Crear faltantes-obra
    await this.crearFaltantesObra(remito);

    // 9. Descontar stock (primer intento sincrónico)
    const advertencias: string[] = [];
    if (proveedor) {
      try {
        await this.descontarStock(remito, pedido.obraId, proveedor);
        await this.repository.updateEstadoStock(remito.id, 'APLICADO');
        await this.repository.incrementarIntentos(remito.id);
      } catch {
        advertencias.push('SHEETS_UNAVAILABLE');
        await this.repository.incrementarIntentos(remito.id);
        this.agendarReintento(remito.id, pedido.obraId, proveedor, 0);
      }
    } else {
      advertencias.push('SHEETS_UNAVAILABLE');
      await this.repository.updateEstadoStock(remito.id, 'STOCK_PENDIENTE');
    }

    return { ...remito, numeroRemitoStr, advertencias };
  }

  async descargarExcel(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const remito = await this.repository.findById(id);
    if (!remito) throw new NotFoundException('PEDIDO_NOT_FOUND');
    const fullPath = path.join(process.cwd(), remito.archivoExcel);
    try {
      const buffer = await fs.readFile(fullPath);
      return { buffer, filename: path.basename(fullPath) };
    } catch {
      throw new NotFoundException('Archivo Excel no encontrado');
    }
  }

  async reintentarStock(id: string) {
    const remito = await this.repository.findById(id);
    if (!remito) throw new NotFoundException('PEDIDO_NOT_FOUND');
    if (remito.estadoStock === 'APLICADO') return { mensaje: 'Stock ya aplicado', estadoStock: 'APLICADO' };

    const proveedor = await this.obtenerProveedor(remito.obraId);
    if (!proveedor) return { mensaje: 'Sin proveedor configurado', estadoStock: remito.estadoStock };

    try {
      await this.descontarStock(remito, remito.obraId, proveedor);
      await this.repository.updateEstadoStock(id, 'APLICADO');
      await this.repository.incrementarIntentos(id);
      return { mensaje: 'Stock aplicado correctamente', estadoStock: 'APLICADO' };
    } catch (err) {
      await this.repository.incrementarIntentos(id);
      return { mensaje: 'Error al aplicar stock', error: (err as Error).message, estadoStock: 'STOCK_PENDIENTE' };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async calcularItems(
    items: ItemRemitoDto[],
    obraId: string,
    proveedor: string | null,
  ): Promise<ItemCalculado[]> {
    const resultado: ItemCalculado[] = [];
    for (const item of items) {
      const material = await this.prisma.material.findUnique({
        where: { id: item.materialId },
        select: { nombreOficial: true, categoria: true, longitudEstandar: true, unidadStock: true },
      });
      if (!material) throw new NotFoundException(`MATERIAL_NOT_FOUND: ${item.materialId}`);

      const { cantidad, unidad } = this.convertirUnidad(material, item.cantidadPedida);

      let cantidadEnStock = 0;
      if (proveedor) {
        try {
          const si = await this.stockService.getStockMaterial(obraId, proveedor, item.materialId);
          cantidadEnStock = si?.cantidad ?? 0;
        } catch {
          // stock no disponible, continúa con 0
        }
      }

      const cantidadFaltante = item.cantidadFaltante ?? 0;
      resultado.push({
        materialId: item.materialId,
        descripcion: material.nombreOficial,
        cantidadPedida: cantidad,
        unidad,
        cantidadEnStock,
        cantidadFaltante,
        condicionEntrega: cantidadFaltante > 0 ? 'CON_FALTANTE' : 'COMPLETO',
        observaciones: item.observaciones,
      });
    }
    return resultado;
  }

  private convertirUnidad(
    material: { categoria: string; longitudEstandar: number | null; unidadStock: string },
    cantidadPedida: number,
  ): { cantidad: number; unidad: string } {
    if (CATEGORIAS_CONVERSION.has(material.categoria)) {
      const longEstandar = material.longitudEstandar ?? 1;
      return { cantidad: Math.ceil(cantidadPedida / longEstandar), unidad: 'u' };
    }
    if (material.categoria === 'CANO_AGUA') {
      return { cantidad: cantidadPedida, unidad: 'm' };
    }
    return { cantidad: cantidadPedida, unidad: 'u' };
  }

  private async obtenerProveedor(obraId: string): Promise<string | null> {
    const op = await this.prisma.obraProveedor.findFirst({
      where: { obraId, activo: true },
      select: { proveedor: true },
    });
    return op?.proveedor ?? null;
  }

  private async guardarExcel(buffer: Buffer, fecha: Date, numero: number): Promise<string> {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const nro = String(numero).padStart(5, '0');
    const dir = path.join(process.cwd(), 'storage', 'remitos', String(year), month);
    await fs.mkdir(dir, { recursive: true });
    const filename = `remito-${nro}.xlsx`;
    await fs.writeFile(path.join(dir, filename), buffer);
    return path.posix.join('storage', 'remitos', String(year), month, filename);
  }

  private async crearFaltantesObra(remito: any): Promise<void> {
    const itemsConFaltante = (remito.items as any[]).filter((i) => i.cantidadFaltante > 0);
    for (const item of itemsConFaltante) {
      await this.faltantesService.crear({
        remitoSalidaId: remito.id,
        itemRemitoId: item.id,
        obraId: remito.obraId,
        materialId: item.materialId,
        descripcion: item.descripcion,
        cantidadPedida: item.cantidadPedida,
        cantidadFaltante: item.cantidadFaltante,
        unidad: item.unidad,
      });
    }
  }

  private async descontarStock(remito: any, obraId: string, proveedor: string): Promise<void> {
    const items = (remito.items as any[]).map((i) => ({
      materialId: i.materialId,
      cantidad: i.cantidadPedida,
    }));
    const numeroRemito = this.numerador.formatear(remito.numeroRemito);
    await this.stockService.descontar(obraId, proveedor, { items, numeroRemito } as any);
  }

  private agendarReintento(remitoId: string, obraId: string, proveedor: string, intento: number): void {
    if (intento >= BACKOFFS_MS.length) return;
    setTimeout(async () => {
      try {
        const remito = await this.repository.findById(remitoId);
        if (!remito || remito.estadoStock === 'APLICADO') return;
        await this.descontarStock(remito, obraId, proveedor);
        await this.repository.updateEstadoStock(remitoId, 'APLICADO');
        await this.repository.incrementarIntentos(remitoId);
        this.logger.log(`Stock aplicado tras reintento ${intento + 1}`);
      } catch {
        await this.repository.incrementarIntentos(remitoId);
        if (intento + 1 >= BACKOFFS_MS.length) {
          await this.repository.updateEstadoStock(remitoId, 'STOCK_PENDIENTE');
          this.logger.error(`Stock marcado STOCK_PENDIENTE tras ${BACKOFFS_MS.length} reintentos`);
        } else {
          this.agendarReintento(remitoId, obraId, proveedor, intento + 1);
        }
      }
    }, BACKOFFS_MS[intento]);
  }
}
