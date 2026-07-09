import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PrismaService } from '../../prisma/prisma.service';
import { FaltantesObraService } from '../../faltantes-obra/services/faltantes-obra.service';
import { RemitosSalidaRepository, CreateRemitoData } from '../repositories/remitos-salida.repository';
import { RemitoNumeradorService } from './remito-numerador.service';
import { RemitoExcelService, RemitoExcelData, MAX_ITEMS_POR_REMITO } from './remito-excel.service';
import { CreateRemitoDto } from '../dto/create-remito.dto';
import { ItemRemitoDto } from '../dto/item-remito.dto';

const CATEGORIAS_CONVERSION = new Set(['CANO_CLOACA', 'CANO_GAS', 'CANO_ELECTRICO']);

interface ItemCalculado {
  materialId: string | null;
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: RemitosSalidaRepository,
    private readonly numerador: RemitoNumeradorService,
    private readonly excelService: RemitoExcelService,
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

    const remitoExistente = await this.prisma.remitoSalida.findFirst({ where: { pedidoId: dto.pedidoId } });
    if (remitoExistente) throw new UnprocessableEntityException('PEDIDO_YA_TIENE_REMITO');

    // 2. Calcular ítems (conversión de unidades) y dividir en lotes de a lo sumo
    //    MAX_ITEMS_POR_REMITO, ya que el remito Excel tiene una grilla fija de esa
    //    cantidad de filas por sección. Cada lote se convierte en su propio remito.
    const itemsCalculados = await this.calcularItems(dto.items);
    const fechaRetiro = new Date(dto.fechaRetiroDeposito);
    const lotes = this.dividirEnLotes(itemsCalculados, MAX_ITEMS_POR_REMITO);

    const remitosGenerados: Array<Awaited<ReturnType<RemitosSalidaRepository['create']>> & { numeroRemitoStr: string; advertencias: string[] }> = [];
    for (const lote of lotes) {
      const numeroRemito = await this.numerador.siguiente();
      const numeroRemitoStr = this.numerador.formatear(numeroRemito);

      const excelData: RemitoExcelData = {
        obraNombre: pedido.obra.nombre,
        numeroRemitoStr,
        solicitante: pedido.solicitante,
        encargadoDeposito: dto.encargadoDeposito,
        encargadoTraslado: dto.encargadoTraslado,
        fechaPedidoObra: pedido.fechaPedido,
        fechaRetiroDeposito: fechaRetiro,
        items: lote,
      };
      const excelBuffer = await this.excelService.generar(excelData);
      const archivoExcel = await this.guardarExcel(excelBuffer, fechaRetiro, numeroRemito);

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
        items: lote,
      };
      const remito = await this.repository.create(createData);
      await this.crearFaltantesObra(remito);
      remitosGenerados.push({ ...remito, numeroRemitoStr, advertencias: [] });
    }

    // 3. Marcar pedido como REMITO_GENERADO
    await this.prisma.pedido.update({
      where: { id: dto.pedidoId },
      data: { estado: 'REMITO_GENERADO' as any },
    });

    return remitosGenerados;
  }

  private dividirEnLotes<T>(items: T[], tamano: number): T[][] {
    const lotes: T[][] = [];
    for (let i = 0; i < items.length; i += tamano) {
      lotes.push(items.slice(i, i + tamano));
    }
    return lotes.length > 0 ? lotes : [[]];
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

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async calcularItems(items: ItemRemitoDto[]): Promise<ItemCalculado[]> {
    const resultado: ItemCalculado[] = [];
    for (const item of items) {
      if (!item.materialId) {
        // Flujo directo: sin resolución de catálogo, descripción viene del item
        resultado.push({
          materialId: null,
          descripcion: item.descripcion ?? 'Sin descripción',
          cantidadPedida: item.cantidadPedida,
          unidad: 'u',
          cantidadEnStock: 0,
          cantidadFaltante: item.cantidadFaltante ?? 0,
          condicionEntrega: 'COMPLETO',
          observaciones: item.observaciones,
        });
        continue;
      }

      const material = await this.prisma.material.findUnique({
        where: { id: item.materialId },
        select: { nombreOficial: true, categoria: true, longitudEstandar: true, unidadStock: true },
      });
      if (!material) throw new NotFoundException(`MATERIAL_NOT_FOUND: ${item.materialId}`);

      const { cantidad, unidad } = this.convertirUnidad(material, item.cantidadPedida);

      const cantidadFaltante = item.cantidadFaltante ?? 0;
      resultado.push({
        materialId: item.materialId,
        descripcion: material.nombreOficial,
        cantidadPedida: cantidad,
        unidad,
        cantidadEnStock: 0,
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
    const itemsConFaltante = (remito.items as any[]).filter((i) => i.cantidadFaltante > 0 && i.materialId);
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
}
