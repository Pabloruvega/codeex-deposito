import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockRepository } from '../../stock/repositories/stock.repository';
import { RecepcionesRepository } from '../repositories/recepciones.repository';
import { FaltantesProveedorRepository } from '../repositories/faltantes-proveedor.repository';
import { ComparadorFacturaService } from './comparador-factura.service';
import { CreateRecepcionDto } from '../dto/create-recepcion.dto';
import { ActualizarCantidadesDto } from '../dto/actualizar-cantidades.dto';

@Injectable()
export class RecepcionesService {
  constructor(
    private readonly recepcionesRepo: RecepcionesRepository,
    private readonly faltantesRepo: FaltantesProveedorRepository,
    private readonly comparador: ComparadorFacturaService,
    private readonly stockRepo: StockRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(filtros: { obraId?: string; proveedor?: string; estado?: string }) {
    return this.recepcionesRepo.findAll(filtros);
  }

  async findById(id: string) {
    const recepcion = await this.recepcionesRepo.findById(id);
    if (!recepcion) throw new NotFoundException('RECEPCION_NOT_FOUND');
    return recepcion;
  }

  async create(dto: CreateRecepcionDto) {
    const obra = await this.prisma.obra.findUnique({ where: { id: dto.obraId } });
    if (!obra) throw new NotFoundException('OBRA_NOT_FOUND');

    const itemsData = await Promise.all(
      dto.items.map(async (item) => {
        const material = await this.prisma.material.findFirst({
          where: {
            OR: [
              { codigoProveedor: item.codigoProveedor },
              { alias: { some: { texto: item.codigoProveedor } } },
            ],
          },
          select: { id: true },
        });
        if (!material) {
          throw new NotFoundException(`MATERIAL_NOT_FOUND_BY_CODIGO: ${item.codigoProveedor}`);
        }

        if (item.cantidadRecibida > item.cantidadFacturada) {
          throw new UnprocessableEntityException('CANTIDAD_INVALIDA');
        }

        const { diferencia, tieneFaltante } = this.comparador.calcular(
          item.cantidadFacturada,
          item.cantidadRecibida,
        );

        return {
          materialId: material.id,
          codigoProveedor: item.codigoProveedor,
          descripcionProveedor: item.descripcionProveedor,
          cantidadFacturada: item.cantidadFacturada,
          cantidadRecibida: item.cantidadRecibida,
          diferencia,
          tieneFaltante,
        };
      }),
    );

    const estado = this.comparador.determinarEstado(itemsData);

    const recepcion = await this.recepcionesRepo.create({
      obraId: dto.obraId,
      proveedor: dto.proveedor,
      numeroRemito: dto.numeroRemito,
      numeroFactura: dto.numeroFactura,
      fechaRemito: new Date(dto.fechaRemito),
      estado,
      items: itemsData,
    });

    for (const item of itemsData) {
      if (item.cantidadRecibida > 0) {
        await this.stockRepo.upsertItem(dto.obraId, dto.proveedor, item.materialId, item.cantidadRecibida);
      }
      if (item.tieneFaltante) {
        await this.faltantesRepo.create({
          recepcionId: recepcion.id,
          obraId: dto.obraId,
          proveedor: dto.proveedor,
          numeroFactura: dto.numeroFactura,
          numeroRemito: dto.numeroRemito,
          materialId: item.materialId,
          cantidadFacturada: item.cantidadFacturada,
          cantidadRecibida: item.cantidadRecibida,
          diferencia: item.diferencia,
          fechaRemito: new Date(dto.fechaRemito),
        });
      }
    }

    return this.recepcionesRepo.findById(recepcion.id);
  }

  async actualizarItems(id: string, dto: ActualizarCantidadesDto) {
    const recepcion = await this.recepcionesRepo.findById(id);
    if (!recepcion) throw new NotFoundException('RECEPCION_NOT_FOUND');
    if (recepcion.estado === 'COMPLETA') throw new ConflictException('RECEPCION_YA_COMPLETA');

    for (const itemUpdate of dto.items) {
      const itemActual = recepcion.items.find((i) => i.id === itemUpdate.itemId);
      if (!itemActual) throw new NotFoundException('ITEM_NOT_FOUND');

      if (itemUpdate.cantidadRecibida > itemActual.cantidadFacturada) {
        throw new UnprocessableEntityException('CANTIDAD_INVALIDA');
      }

      const delta = itemUpdate.cantidadRecibida - itemActual.cantidadRecibida;
      const { diferencia, tieneFaltante } = this.comparador.calcular(
        itemActual.cantidadFacturada,
        itemUpdate.cantidadRecibida,
      );

      if (delta !== 0) {
        await this.stockRepo.upsertItem(recepcion.obraId, recepcion.proveedor, itemActual.materialId, delta);
      }

      await this.recepcionesRepo.updateItem(itemActual.id, {
        cantidadRecibida: itemUpdate.cantidadRecibida,
        diferencia,
        tieneFaltante,
      });
    }

    const recepcionActualizada = await this.recepcionesRepo.findById(id);
    const nuevoEstado = recepcionActualizada!.items.every((i) => i.diferencia === 0)
      ? 'COMPLETA'
      : 'CON_DIFERENCIAS';

    return this.recepcionesRepo.updateEstado(id, nuevoEstado);
  }

  async getFaltantes(filtros: {
    proveedor?: string;
    obraId?: string;
    resuelto?: boolean;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    return this.faltantesRepo.findAll(filtros);
  }

  async getSugerenciasFaltantes(id: string) {
    const recepcion = await this.recepcionesRepo.findById(id);
    if (!recepcion) throw new NotFoundException('RECEPCION_NOT_FOUND');

    const materialIds = recepcion.items.map((i) => i.materialId);
    return this.faltantesRepo.findPendientesParaSugerencia({
      proveedor: recepcion.proveedor,
      obraId: recepcion.obraId,
      materialIds,
    });
  }

  async resolverFaltantes(id: string, faltanteIds: string[]) {
    const recepcion = await this.recepcionesRepo.findById(id);
    if (!recepcion) throw new NotFoundException('RECEPCION_NOT_FOUND');

    const fechaResolucion = new Date();
    const resueltos: Awaited<ReturnType<typeof this.faltantesRepo.resolver>>[] = [];
    for (const faltanteId of faltanteIds) {
      const resuelto = await this.faltantesRepo.resolver(faltanteId, fechaResolucion);
      resueltos.push(resuelto);
    }

    return { resueltos: resueltos.length, items: resueltos };
  }
}
