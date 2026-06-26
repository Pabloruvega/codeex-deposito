import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RemitoNumeradorService {
  constructor(private readonly prisma: PrismaService) {}

  async siguiente(): Promise<number> {
    const ultimo = await this.prisma.remitoSalida.findFirst({
      orderBy: { numeroRemito: 'desc' },
      select: { numeroRemito: true },
    });
    return (ultimo?.numeroRemito ?? 0) + 1;
  }

  formatear(numero: number): string {
    return String(numero).padStart(5, '0');
  }
}
