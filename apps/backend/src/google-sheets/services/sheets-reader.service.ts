import { Injectable, Logger } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { GoogleSheetsAuthService } from './google-sheets-auth.service';

export interface FilaMaterial {
  tipo: string;
  codigo: string;
  descripcion: string;
  unidad: string;
}

export interface FilaStock {
  codigo: string;
  descripcion: string;
  stockActual: number;
}

@Injectable()
export class SheetsReaderService {
  private readonly logger = new Logger(SheetsReaderService.name);

  constructor(private readonly auth: GoogleSheetsAuthService) {}

  async leerMateriales(spreadsheetId: string): Promise<FilaMaterial[]> {
    const sheets = await this.auth.getSheetsClient();
    const hojaNombre = await this.obtenerPrimerHoja(sheets, spreadsheetId);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${hojaNombre}'!A7:D500`,
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const rows = res.data.values ?? [];
    return rows
      .filter((row) => String(row[2] ?? '').trim())
      .map((row) => ({
        tipo: String(row[0] ?? '').trim(),
        codigo: String(row[1] ?? '').trim(),
        descripcion: String(row[2] ?? '').trim(),
        unidad: String(row[3] ?? '').trim(),
      }));
  }

  async leerStock(spreadsheetId: string): Promise<FilaStock[]> {
    const sheets = await this.auth.getSheetsClient();
    const hojaNombre = await this.obtenerPrimerHoja(sheets, spreadsheetId);

    const stockColIndex = await this.encontrarColumnaStock(sheets, spreadsheetId, hojaNombre);
    if (stockColIndex < 0) {
      this.logger.warn('No se encontró columna STOCK en el archivo');
      return [];
    }

    const stockColLetter = colIndexToLetter(stockColIndex);

    const [codigoRes, stockRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${hojaNombre}'!B7:C500`,
        valueRenderOption: 'FORMATTED_VALUE',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${hojaNombre}'!${stockColLetter}7:${stockColLetter}500`,
        valueRenderOption: 'UNFORMATTED_VALUE',
      }),
    ]);

    const codigoRows = codigoRes.data.values ?? [];
    const stockRows = stockRes.data.values ?? [];

    return codigoRows
      .map((row, i) => ({
        codigo: String(row[0] ?? '').trim(),
        descripcion: String(row[1] ?? '').trim(),
        stockActual: Number(stockRows[i]?.[0] ?? 0) || 0,
      }))
      .filter((item) => item.descripcion);
  }

  async encontrarColumnaStock(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    hojaNombre: string,
  ): Promise<number> {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${hojaNombre}'!A1:ZZ6`,
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const rows = res.data.values ?? [];
    for (const row of rows) {
      for (let col = 0; col < row.length; col++) {
        if (String(row[col] ?? '').trim().toUpperCase().startsWith('STOCK')) {
          return col;
        }
      }
    }
    return -1;
  }

  async obtenerPrimerHoja(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<string> {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    return meta.data.sheets?.[0]?.properties?.title ?? 'Hoja1';
  }
}

export function colIndexToLetter(index: number): string {
  let letter = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}
