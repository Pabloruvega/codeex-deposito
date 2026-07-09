import { Body, Controller, NotFoundException, Post, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SheetsReaderService } from '../services/sheets-reader.service';

const TIPO_CATEGORIA: Record<string, string> = {
  Conector: 'ACCESORIO_PLOMERIA',
  Union: 'ACCESORIO_PLOMERIA',
  Cajas: 'ACCESORIO_PLOMERIA',
  Cinta: 'OTRO',
  Cañeria: 'CANO_CLOACA',
};

function mapCategoria(tipo: string): string {
  return TIPO_CATEGORIA[tipo] ?? 'OTRO';
}

class ObraProveedorDto {
  obraId: string;
  proveedor: string;
}

@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(
    private readonly reader: SheetsReaderService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('importar-materiales')
  async importarMateriales(@Body() dto: ObraProveedorDto) {
    const op = await this.prisma.obraProveedor.findFirst({
      where: { obraId: dto.obraId, proveedor: dto.proveedor, activo: true },
    });
    if (!op) throw new NotFoundException('OBRA_PROVEEDOR_NOT_FOUND');
    if (!op.spreadsheetIdStock)
      throw new UnprocessableEntityException('SPREADSHEET_ID_NO_CONFIGURADO');

    const filas = await this.reader.leerMateriales(op.spreadsheetIdStock);
    let creados = 0;
    let existentes = 0;
    const errores: string[] = [];

    for (const fila of filas) {
      try {
        const existe = fila.codigo
          ? await this.prisma.material.findFirst({ where: { codigoProveedor: fila.codigo } })
          : await this.prisma.material.findFirst({ where: { nombreOficial: fila.descripcion } });
        if (existe) {
          existentes++;
          continue;
        }
        await this.prisma.material.create({
          data: {
            codigoProveedor: fila.codigo || null,
            nombreOficial: fila.descripcion,
            categoria: mapCategoria(fila.tipo) as any,
            unidadStock: 'UNIDAD',
            unidadPedido: 'UNIDAD',
          },
        });
        creados++;
      } catch (err) {
        errores.push(`${fila.descripcion}: ${(err as Error).message}`);
      }
    }

    return { creados, existentes, errores };
  }

  @Post('importar-stock')
  async importarStock(@Body() dto: ObraProveedorDto) {
    const op = await this.prisma.obraProveedor.findFirst({
      where: { obraId: dto.obraId, proveedor: dto.proveedor, activo: true },
    });
    if (!op) throw new NotFoundException('OBRA_PROVEEDOR_NOT_FOUND');
    if (!op.spreadsheetIdStock) throw new UnprocessableEntityException('SPREADSHEET_ID_NO_CONFIGURADO');

    const filas = await this.reader.leerStock(op.spreadsheetIdStock);
    let actualizados = 0;
    const errores: string[] = [];

    for (const fila of filas) {
      try {
        const material = fila.codigo
          ? await this.prisma.material.findFirst({ where: { codigoProveedor: fila.codigo } })
          : await this.prisma.material.findFirst({ where: { nombreOficial: fila.descripcion } });
        if (!material) continue;

        await this.prisma.stockItem.upsert({
          where: {
            obraId_proveedor_materialId: {
              obraId: dto.obraId,
              proveedor: dto.proveedor,
              materialId: material.id,
            },
          },
          create: {
            obraId: dto.obraId,
            proveedor: dto.proveedor,
            materialId: material.id,
            cantidad: fila.stockActual,
          },
          update: { cantidad: fila.stockActual },
        });
        actualizados++;
      } catch (err) {
        errores.push(`${fila.codigo}: ${(err as Error).message}`);
      }
    }

    return { actualizados, errores };
  }
}
