import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import ExcelJS from 'exceljs';

export interface RemitoExcelData {
  obraNombre: string;
  numeroRemitoStr: string;
  solicitante: string;
  encargadoDeposito: string;
  encargadoTraslado: string;
  fechaPedidoObra: Date;
  fechaRetiroDeposito: Date;
  items: {
    descripcion: string;
    cantidadPedida: number;
    unidad: string;
    cantidadFaltante: number;
    observaciones?: string;
  }[];
}

export const MAX_ITEMS_POR_REMITO = 20;

const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'plantilla-remito.xlsx');
const PRIMERA_FILA_ITEM = 22;

@Injectable()
export class RemitoExcelService {
  private templateBuffer: Buffer | null = null;

  async generar(datos: RemitoExcelData): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load((await this.cargarTemplate()) as any);
    // exceljs doesn't round-trip calcPr@fullCalcOnLoad on read, so it must be re-set here:
    // without it, Excel may show stale cached results for ADMINISTRACION/OBRA (mirrored via formula).
    wb.calcProperties = { fullCalcOnLoad: true };
    const ws = wb.worksheets[0];

    ws.getCell('E9').value = datos.obraNombre;
    ws.getCell('N9').value = `REMITO N° ${datos.numeroRemitoStr}`;
    ws.getCell('E13').value = datos.solicitante;
    ws.getCell('F14').value = datos.encargadoDeposito;
    ws.getCell('F15').value = datos.encargadoTraslado;
    ws.getCell('F16').value = datos.fechaPedidoObra;
    ws.getCell('F17').value = datos.fechaRetiroDeposito;

    datos.items.forEach((item, idx) => {
      const fila = PRIMERA_FILA_ITEM + idx;
      ws.getCell(`E${fila}`).value = `${item.cantidadPedida} ${item.unidad}`;
      ws.getCell(`F${fila}`).value = item.descripcion;
      ws.getCell(`J${fila}`).value = item.cantidadFaltante > 0 ? item.cantidadFaltante : '';
      ws.getCell(`O${fila}`).value = item.observaciones ?? '';
    });

    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }

  private async cargarTemplate(): Promise<Buffer> {
    if (!this.templateBuffer) {
      this.templateBuffer = await fs.promises.readFile(TEMPLATE_PATH);
    }
    return this.templateBuffer;
  }
}
