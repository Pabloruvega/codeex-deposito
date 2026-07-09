import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as path from 'path';
import { pathToFileURL } from 'url';
import type { ItemExtraido } from './pedido-resolver.service';

export interface PdfParsedResult {
  obra: string | null;
  solicitante: string;
  fechaPedido: Date;
  items: ItemExtraido[];
  advertencias: string[];
}

interface PosItem {
  str: string;
  x: number;
  y: number;
}

// Column separator: date in dd/mm/yyyy format marks the end of the description cell
const RE_DATE_COL = /\s+\d{1,2}\/\d{1,2}\/\d{4}/;
// Quantity token: digits + optional unit letters (e.g. "27", "130m", "1.5")
const RE_QTY = /^(\d+(?:[.,]\d+)?)([a-zA-Z]*)$/;

@Injectable()
export class PdfExtractorService {
  private readonly logger = new Logger(PdfExtractorService.name);

  async extract(buffer: Buffer): Promise<PdfParsedResult> {
    const posItems = await this.extractPositionalItems(buffer);

    if (!posItems.length) {
      throw new BadRequestException('PDF_SIN_ITEMS');
    }

    return this.parsear(posItems);
  }

  // ─── Text extraction with X,Y positions ───────────────────────────────────
  // pdfjs-dist returns text items from the PDF content stream in arbitrary order.
  // We capture each item's X,Y transform so we can reconstruct proper visual rows.

  private async extractPositionalItems(buffer: Buffer): Promise<PosItem[]> {
    try {
      // pdfjs-dist is ESM-only; dynamic import is the correct call site from CJS/TS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');

      // Node.js has no native Worker — point pdfjs to the bundled worker file.
      // require.resolve works in CJS context (NestJS compiles to CJS).
      const pdfjsPkg: string = require.resolve('pdfjs-dist/package.json');
      const workerFile = path.join(
        path.dirname(pdfjsPkg),
        'legacy',
        'build',
        'pdf.worker.mjs',
      );
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerFile).href;

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        disableFontFace: true,
        isEvalSupported: false,
      });

      const pdf = await loadingTask.promise;
      const items: PosItem[] = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();

        for (const item of content.items as Array<{ str: string; transform: number[] }>) {
          if (!item.str?.trim()) continue;
          items.push({
            str: item.str,
            x: Math.round(item.transform[4]),
            y: Math.round(item.transform[5]),
          });
        }
      }

      return items;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`pdfjs extraction failed: ${(err as Error).message}`);
      throw new BadRequestException('ARCHIVO_INVALIDO');
    }
  }

  // ─── Core parser ────────────────────────────────────────────────────────────

  private parsear(posItems: PosItem[]): PdfParsedResult {
    const advertencias: string[] = [];

    // ── Step 1: group text items into visual rows by Y coordinate ────────────
    // PDF uses Y=0 at bottom of page; higher Y = higher on page.
    // ±6pt tolerance handles slight baseline differences within the same cell
    // (e.g., special chars like ½ ¾ may have a slightly different baseline).
    const Y_TOL = 6;
    const rowMap = new Map<number, PosItem[]>();
    const yKeys: number[] = [];

    for (const item of posItems) {
      const existingY = yKeys.find((y) => Math.abs(y - item.y) <= Y_TOL);
      if (existingY !== undefined) {
        rowMap.get(existingY)!.push(item);
      } else {
        rowMap.set(item.y, [item]);
        yKeys.push(item.y);
      }
    }

    // Sort rows top-to-bottom (Y descending = higher on page first)
    const rows = yKeys
      .sort((a, b) => b - a)
      .map((y) =>
        rowMap
          .get(y)!
          .sort((a, b) => a.x - b.x) // left to right within each row
          .map((i) => i.str),
      );

    // ── Step 2: extract header metadata ─────────────────────────────────────
    let obra: string | null = null;
    let solicitante = 'No especificado';
    let fechaPedido: Date | null = null;

    for (const row of rows) {
      const line = row.join(' ').replace(/\s+/g, ' ').trim();

      if (!obra) {
        // "OBRA: Remodelación Casa Santiago del Estero Fecha: 12/6/2026"
        const m = line.match(/obra[:\s]+(.+?)(?:\s+fecha[:\s]|$)/i);
        if (m) obra = m[1].trim();
      }
      if (solicitante === 'No especificado') {
        const m = line.match(/solicitante[:\s]+(.+)/i);
        if (m) solicitante = m[1].trim();
      }
      // Take the first date found (header row carries the pedido date)
      if (!fechaPedido) {
        const mF = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (mF) {
          const [, d, mo, y] = mF;
          const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y);
          fechaPedido = new Date(year, parseInt(mo) - 1, parseInt(d));
        }
      }
    }

    // ── Step 3: parse table data rows ────────────────────────────────────────
    // With correct Y-grouping each visual table row looks like:
    //   ["1", "27", "Codo de 20 x ½", "12/6/2026", "Agua fría y caliente"]
    //
    // Strategy: join row tokens, strip the date column and everything to its right
    // (Fecha de Pedido, Fecha de Recepción, Observaciones), then match
    // "<item#> <qty> <description>".
    const itemMap = new Map<number, ItemExtraido>();

    for (const row of rows) {
      const joined = row.join(' ').replace(/\s+/g, ' ').trim();

      // Remove date column and any trailing content (obs, etc.)
      const beforeDate = joined.split(RE_DATE_COL)[0].trim();

      // Match: integer item#, quantity token, rest is description
      const m = beforeDate.match(/^(\d+)\s+(\d+(?:[.,]\d+)?[a-zA-Z]*)\s+(.+)$/);
      if (!m) continue;

      const nro = parseInt(m[1]);
      if (nro < 1 || nro > 9999) continue;

      const qtyStr = m[2];
      const desc = m[3].trim();
      if (!desc || desc.length < 2) continue;

      // Skip duplicates (same item# shouldn't appear twice, but guard just in case)
      if (itemMap.has(nro)) continue;

      const qtyMatch = RE_QTY.exec(qtyStr);
      if (!qtyMatch) continue;

      itemMap.set(nro, {
        numeroItem: nro,
        textoOriginal: desc,
        cantidadOriginal: qtyStr,
        cantidadNormalizada: parseFloat(qtyMatch[1].replace(',', '.')),
        unidadPedido: qtyMatch[2] ? qtyMatch[2].toLowerCase() : 'u',
        descripcion: desc,
      });
    }

    const items = [...itemMap.values()].sort((a, b) => a.numeroItem - b.numeroItem);

    if (items.length === 0) {
      advertencias.push('FORMATO_NO_RECONOCIDO');
    }

    return {
      obra,
      solicitante,
      fechaPedido: fechaPedido ?? new Date(),
      items,
      advertencias,
    };
  }
}
