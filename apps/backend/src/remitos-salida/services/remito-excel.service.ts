import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

export interface RemitoExcelData {
  obraNombre: string;
  numeroRemitoStr: string;
  solicitante: string;
  encargadoDeposito: string;
  encargadoTraslado: string;
  fechaPedidoObra: string;
  fechaRetiroDeposito: string;
  items: {
    descripcion: string;
    cantidadPedida: number;
    unidad: string;
    cantidadFaltante: number;
    observaciones?: string;
  }[];
}

const TITULO = 'REMITO DE RETIRO DE MATERIALES DE DEPÓSITO CODEEX - HUDSON 886 SUR';
const SECCIONES = ['DEPOSITO', 'ADMINISTRACION', 'OBRA'] as const;
const ENCABEZADOS_TABLA = ['Item', 'Cantidad', 'Descripción', 'Faltante', 'Sin Fallas', 'Defectuoso', 'Obs.'];

@Injectable()
export class RemitoExcelService {
  async generar(datos: RemitoExcelData): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'CODEEX Depósito';
    const ws = wb.addWorksheet('Remito');

    ws.columns = [
      { key: 'a', width: 6 },
      { key: 'b', width: 12 },
      { key: 'c', width: 35 },
      { key: 'd', width: 10 },
      { key: 'e', width: 12 },
      { key: 'f', width: 12 },
      { key: 'g', width: 25 },
    ];

    let fila = 1;
    for (const seccion of SECCIONES) {
      fila = this.agregarSeccion(ws, fila, seccion, datos);
      fila += 2;
    }

    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }

  private agregarSeccion(
    ws: ExcelJS.Worksheet,
    inicioFila: number,
    seccion: string,
    datos: RemitoExcelData,
  ): number {
    let f = inicioFila;

    // Título
    ws.mergeCells(f, 1, f, 7);
    const celdaTitulo = ws.getCell(f, 1);
    celdaTitulo.value = TITULO;
    celdaTitulo.font = { bold: true, size: 11 };
    celdaTitulo.alignment = { horizontal: 'center', vertical: 'middle' };
    celdaTitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } };
    celdaTitulo.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    ws.getRow(f).height = 22;
    f++;

    // Nombre de sección
    ws.mergeCells(f, 1, f, 7);
    const celdaSeccion = ws.getCell(f, 1);
    celdaSeccion.value = `SECCIÓN: ${seccion}`;
    celdaSeccion.font = { bold: true, size: 10 };
    celdaSeccion.alignment = { horizontal: 'center' };
    celdaSeccion.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E0F0' } };
    f++;

    // Campos de encabezado
    this.setCampo(ws, f, 1, 'OBRA:', datos.obraNombre, 2);
    this.setCampo(ws, f, 5, 'Nro REMITO:', datos.numeroRemitoStr, 1);
    f++;

    this.setCampo(ws, f, 1, 'SOLICITANTE:', datos.solicitante, 2);
    this.setCampo(ws, f, 5, 'ENCARGADO DEP.:', datos.encargadoDeposito, 1);
    f++;

    this.setCampo(ws, f, 1, 'FECHA PEDIDO OBRA:', datos.fechaPedidoObra, 2);
    this.setCampo(ws, f, 5, 'ENCARGADO TRASLADO:', datos.encargadoTraslado, 1);
    f++;

    this.setCampo(ws, f, 1, 'FECHA RETIRO DEP.:', datos.fechaRetiroDeposito, 2);
    f++;

    f++; // fila en blanco

    // Encabezado de tabla
    const filaHeader = ws.getRow(f);
    ENCABEZADOS_TABLA.forEach((h, i) => {
      const celda = filaHeader.getCell(i + 1);
      celda.value = h;
      celda.font = { bold: true };
      celda.alignment = { horizontal: 'center' };
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFBFBF' } };
      celda.border = { bottom: { style: 'thin' }, top: { style: 'thin' }, right: { style: 'thin' } };
    });
    f++;

    // Filas de ítems
    datos.items.forEach((item, idx) => {
      const filaItem = ws.getRow(f);
      filaItem.getCell(1).value = idx + 1;
      filaItem.getCell(2).value = `${item.cantidadPedida} ${item.unidad}`;
      filaItem.getCell(3).value = item.descripcion;
      filaItem.getCell(4).value = item.cantidadFaltante > 0 ? item.cantidadFaltante : '';
      filaItem.getCell(7).value = item.observaciones ?? '';
      filaItem.eachCell({ includeEmpty: true }, (celda) => {
        celda.border = { bottom: { style: 'hair' }, right: { style: 'hair' } };
      });
      f++;
    });

    f++; // fila en blanco

    // Línea de firmas
    ws.mergeCells(f, 1, f, 3);
    ws.getCell(f, 1).value = 'Firma Encargado Depósito: _______________________';
    ws.mergeCells(f, 5, f, 7);
    ws.getCell(f, 5).value = 'Firma Encargado Traslado: _______________________';
    f++;

    return f;
  }

  private setCampo(ws: ExcelJS.Worksheet, fila: number, colLabel: number, label: string, valor: string, colsValor: number) {
    ws.getCell(fila, colLabel).value = label;
    ws.getCell(fila, colLabel).font = { bold: true };
    ws.mergeCells(fila, colLabel + 1, fila, colLabel + colsValor);
    ws.getCell(fila, colLabel + 1).value = valor;
  }
}
