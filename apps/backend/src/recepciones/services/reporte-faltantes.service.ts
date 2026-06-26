import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

@Injectable()
export class ReporteFaltantesService {
  async generarExcel(faltantes: any[]): Promise<{ buffer: Buffer; filename: string }> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'CODEEX Depósito';
    const ws = wb.addWorksheet('Faltantes Proveedor');

    ws.columns = [
      { header: 'Proveedor', key: 'proveedor', width: 22 },
      { header: 'Obra ID', key: 'obraId', width: 38 },
      { header: 'N° Factura', key: 'numeroFactura', width: 16 },
      { header: 'N° Remito', key: 'numeroRemito', width: 16 },
      { header: 'Material', key: 'material', width: 35 },
      { header: 'Cant. Facturada', key: 'cantidadFacturada', width: 16 },
      { header: 'Cant. Recibida', key: 'cantidadRecibida', width: 15 },
      { header: 'Diferencia', key: 'diferencia', width: 12 },
      { header: 'Fecha Remito', key: 'fechaRemito', width: 15 },
      { header: 'Resuelto', key: 'resuelto', width: 10 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFBFBF' } };

    for (const f of faltantes) {
      ws.addRow({
        proveedor: f.proveedor,
        obraId: f.obraId,
        numeroFactura: f.numeroFactura,
        numeroRemito: f.numeroRemito,
        material: f.material?.nombreOficial ?? f.materialId,
        cantidadFacturada: f.cantidadFacturada,
        cantidadRecibida: f.cantidadRecibida,
        diferencia: f.diferencia,
        fechaRemito: new Date(f.fechaRemito).toLocaleDateString('es-AR'),
        resuelto: f.resuelto ? 'SÍ' : 'NO',
      });
    }

    const buffer = (await wb.xlsx.writeBuffer()) as unknown as Buffer;
    const fecha = new Date().toISOString().slice(0, 10);
    return { buffer, filename: `faltantes-proveedor-${fecha}.xlsx` };
  }
}
