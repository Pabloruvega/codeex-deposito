import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreadoPorAlias } from '../interfaces/material.interface';

@Injectable()
export class AliasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByMaterialId(materialId: string) {
    return this.prisma.alias.findMany({
      where: { materialId },
      orderBy: { creadoEn: 'asc' },
    });
  }

  findByTexto(texto: string) {
    return this.prisma.alias.findUnique({
      where: { texto },
      include: { material: true },
    });
  }

  findAll() {
    return this.prisma.alias.findMany({
      include: { material: true },
    });
  }

  findById(id: string) {
    return this.prisma.alias.findUnique({ where: { id } });
  }

  create(materialId: string, texto: string, creadoPor: CreadoPorAlias = 'DEPOSITO') {
    return this.prisma.alias.create({
      data: { texto, materialId, creadoPor },
      include: { material: true },
    });
  }

  delete(id: string) {
    return this.prisma.alias.delete({ where: { id } });
  }
}
