import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RemitosEntradaRepository } from '../repositories/remitos-entrada.repository';
import { CreateRemitoEntradaDto } from '../dto/create-remito-entrada.dto';

@Injectable()
export class RemitosEntradaService {
  constructor(
    private readonly repo: RemitosEntradaRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(filtros: { obraId?: string; proveedor?: string }) {
    return this.repo.findAll(filtros);
  }

  async findById(id: string) {
    const remito = await this.repo.findById(id);
    if (!remito) throw new NotFoundException('REMITO_ENTRADA_NOT_FOUND');
    return remito;
  }

  async create(dto: CreateRemitoEntradaDto) {
    const obra = await this.prisma.obra.findUnique({ where: { id: dto.obraId } });
    if (!obra) throw new NotFoundException('OBRA_NOT_FOUND');

    const duplicado = await this.repo.findDuplicado(dto.proveedor, dto.obraId, dto.numeroRemito);
    if (duplicado) throw new ConflictException('NUMERO_REMITO_DUPLICADO');

    const itemsConMaterial = await Promise.all(
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
        return {
          codigoProveedor: item.codigoProveedor,
          descripcionProveedor: item.descripcionProveedor,
          cantidad: item.cantidad,
          unidad: item.unidad ?? '',
          materialId: material?.id ?? null,
        };
      }),
    );

    return this.repo.create({
      obraId: dto.obraId,
      proveedor: dto.proveedor,
      numeroRemito: dto.numeroRemito,
      fechaRemito: new Date(dto.fechaRemito),
      items: itemsConMaterial,
    });
  }

  async delete(id: string) {
    const remito = await this.repo.findById(id);
    if (!remito) throw new NotFoundException('REMITO_ENTRADA_NOT_FOUND');
    if (remito.asociadoARecepcion) throw new UnprocessableEntityException('REMITO_YA_ASOCIADO');
    await this.repo.delete(id);
    return { eliminado: true };
  }
}
