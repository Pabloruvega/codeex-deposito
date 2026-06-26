import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateObraProveedorDto } from '../dto/create-obra-proveedor.dto';

@Injectable()
export class ObraProveedorRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByObra(obraId: string) {
    return this.prisma.obraProveedor.findMany({
      where: { obraId, activo: true },
      orderBy: { proveedor: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.obraProveedor.findUnique({ where: { id } });
  }

  create(obraId: string, dto: CreateObraProveedorDto) {
    return this.prisma.obraProveedor.create({
      data: {
        obraId,
        proveedor: dto.proveedor,
        spreadsheetIdStock: dto.spreadsheetIdStock,
        spreadsheetIdControl: dto.spreadsheetIdControl,
      },
    });
  }

  desactivar(id: string) {
    return this.prisma.obraProveedor.update({
      where: { id },
      data: { activo: false },
    });
  }
}
