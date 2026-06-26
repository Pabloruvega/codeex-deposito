import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';

@Injectable()
export class MateriaisRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.material.findMany({
      where: { activo: true },
      orderBy: { nombreOficial: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.material.findUnique({
      where: { id },
      include: { alias: true },
    });
  }

  findByNombreOficial(nombreOficial: string) {
    return this.prisma.material.findFirst({ where: { nombreOficial } });
  }

  create(dto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: {
        codigoProveedor: dto.codigoProveedor ?? null,
        nombreOficial: dto.nombreOficial,
        categoria: dto.categoria,
        unidadStock: dto.unidadStock,
        unidadPedido: dto.unidadPedido,
        longitudEstandar: dto.longitudEstandar ?? null,
      },
    });
  }

  update(id: string, dto: UpdateMaterialDto) {
    return this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.codigoProveedor !== undefined && { codigoProveedor: dto.codigoProveedor }),
        ...(dto.nombreOficial !== undefined && { nombreOficial: dto.nombreOficial }),
        ...(dto.categoria !== undefined && { categoria: dto.categoria }),
        ...(dto.unidadStock !== undefined && { unidadStock: dto.unidadStock }),
        ...(dto.unidadPedido !== undefined && { unidadPedido: dto.unidadPedido }),
        ...(dto.longitudEstandar !== undefined && { longitudEstandar: dto.longitudEstandar }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
      },
    });
  }

  softDelete(id: string) {
    return this.prisma.material.update({
      where: { id },
      data: { activo: false },
    });
  }
}
