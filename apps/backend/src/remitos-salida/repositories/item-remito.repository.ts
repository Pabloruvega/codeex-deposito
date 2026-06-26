import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ItemRemitoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByRemitoId(remitoId: string) {
    return this.prisma.itemRemito.findMany({
      where: { remitoId },
      include: {
        material: { select: { id: true, nombreOficial: true, categoria: true, unidadStock: true } },
        faltanteObra: true,
      },
    });
  }
}
