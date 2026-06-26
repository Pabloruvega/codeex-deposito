import { Injectable, BadRequestException } from '@nestjs/common';

const MIMETYPES_IMAGEN = ['image/jpeg', 'image/png', 'image/jpg'];

@Injectable()
export class ImageExtractorService {
  validar(file: Express.Multer.File): Buffer {
    if (!MIMETYPES_IMAGEN.includes(file.mimetype)) {
      throw new BadRequestException('ARCHIVO_INVALIDO');
    }
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('ARCHIVO_INVALIDO');
    }
    return file.buffer;
  }
}
