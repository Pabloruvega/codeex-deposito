import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateObraDto } from '../dto/create-obra.dto';
import { UpdateObraDto } from '../dto/update-obra.dto';

@Injectable()
export class ObrasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.obra.findMany({
      include: { proveedores: { where: { activo: true }, orderBy: { proveedor: 'asc' } } },
      orderBy: { nombre: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.obra.findUnique({
      where: { id },
      include: { proveedores: { where: { activo: true }, orderBy: { proveedor: 'asc' } } },
    });
  }

  create(dto: CreateObraDto) {
    return this.prisma.obra.create({
      data: { nombre: dto.nombre },
      include: { proveedores: true },
    });
  }

  update(id: string, dto: UpdateObraDto) {
    return this.prisma.obra.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
        ...(dto.activa !== undefined && { activa: dto.activa }),
      },
      include: { proveedores: { where: { activo: true } } },
    });
  }
}
