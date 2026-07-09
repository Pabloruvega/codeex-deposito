import { Injectable, Logger } from '@nestjs/common';
import { GoogleSheetsAuthService } from './google-sheets-auth.service';
import { SheetsReaderService, colIndexToLetter } from './sheets-reader.service';

export interface ItemSheetsRemito {
  codigo: string;
  cantidad: number;
}

@Injectable()
export class SheetsWriterService {
  private readonly logger = new Logger(SheetsWriterService.name);

  constructor(
    private readonly auth: GoogleSheetsAuthService,
    private readonly reader: SheetsReaderService,
  ) {}

  async agregarColumnaRemito(
    spreadsheetId: string,
    numeroRemito: string,
    items: ItemSheetsRemito[],
  ): Promise<void> {
    if (!items.length) return;

    const sheets = await this.auth.getSheetsClient();
    const hojaNombre = await this.reader.obtenerPrimerHoja(sheets, spreadsheetId);

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = meta.data.sheets?.[0]?.properties?.sheetId ?? 0;

    // Find the STOCK column to insert before it
    const stockColIndex = await this.reader.encontrarColumnaStock(sheets, spreadsheetId, hojaNombre);
    if (stockColIndex < 0) {
      this.logger.warn(`No se encontró columna STOCK en ${spreadsheetId}, no se puede agregar columna`);
      return;
    }

    // Insert a new column at stockColIndex position (pushes STOCK one column to the right)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: stockColIndex,
                endIndex: stockColIndex + 1,
              },
              inheritFromBefore: true,
            },
          },
        ],
      },
    });

    const colLetter = colIndexToLetter(stockColIndex);

    // Write remito number in row 5
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${hojaNombre}'!${colLetter}5`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[numeroRemito]] },
    });

    // Build a map: codigo → row number (1-indexed) by reading column B from row 7
    const colBRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${hojaNombre}'!B7:B500`,
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const bValues = colBRes.data.values ?? [];
    const rowByCodigo: Record<string, number> = {};
    for (let i = 0; i < bValues.length; i++) {
      const codigo = String(bValues[i]?.[0] ?? '').trim();
      if (codigo) rowByCodigo[codigo] = 7 + i;
    }

    // Write quantities in batch
    const updateData = items
      .filter((item) => rowByCodigo[item.codigo] !== undefined)
      .map((item) => ({
        range: `'${hojaNombre}'!${colLetter}${rowByCodigo[item.codigo]}`,
        values: [[item.cantidad]],
      }));

    if (updateData.length === 0) {
      this.logger.warn(`Ningún código de remito ${numeroRemito} coincidió con filas en el Sheet`);
      return;
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updateData,
      },
    });

    this.logger.log(
      `Remito ${numeroRemito} sincronizado: ${updateData.length} materiales escritos en columna ${colLetter}`,
    );
  }
}
