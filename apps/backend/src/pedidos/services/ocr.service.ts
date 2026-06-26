import { Injectable, Logger } from '@nestjs/common';

// Tesseract.js v7 usa worker threads: los errores del worker saltan al proceso principal
// y no pueden capturarse con try/catch normal. Se activa cuando haya infraestructura
// de procesamiento de imágenes en producción.
const OCR_HABILITADO = false;

const TEXTO_MOCK =
  '1    5u    Caño agua fría 20mm PN10\n' +
  '2    3u    Codo 90° 20mm\n' +
  '3    1u    Llave de paso 1/2 IPS\n';

export interface OcrResultado {
  text: string;
  esMock: boolean;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async recognizeText(imageBuffer: Buffer): Promise<OcrResultado> {
    if (!OCR_HABILITADO) {
      this.logger.warn('OCR deshabilitado: retornando mock (OCR_PENDIENTE_CALIBRACION)');
      return { text: TEXTO_MOCK, esMock: true };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let worker: any = null;
    try {
      const { createWorker } = await import('tesseract.js');
      worker = await createWorker('spa');
      const { data } = await worker.recognize(imageBuffer);
      return { text: data.text || TEXTO_MOCK, esMock: !data.text };
    } catch (err) {
      this.logger.error(`OCR error: ${(err as Error).message}`);
      return { text: TEXTO_MOCK, esMock: true };
    } finally {
      if (worker) await worker.terminate().catch(() => null);
    }
  }
}
