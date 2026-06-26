import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PedidosRepository } from '../repositories/pedidos.repository';
import { PdfExtractorService } from './pdf-extractor.service';
import type { PdfParsedResult } from './pdf-extractor.service';
import { ImageExtractorService } from './image-extractor.service';
import { OcrService } from './ocr.service';
import { PedidoResolverService, ItemExtraido } from './pedido-resolver.service';
import { ObrasService } from '../../obras/services/obras.service';
import { ActualizarItemDto } from '../dto/actualizar-item.dto';
import { EstadoResolucion, TipoArchivo } from '@prisma/client';

// Unidades de una sola letra o abreviaturas conocidas
const RE_UNIDAD = /^(m|u|l|g|ml|kg|cm|mm|tn|ton|par|set)$/i;

function parsearDocumento(texto: string): {
  solicitante: string;
  fechaPedido: Date;
  items: ItemExtraido[];
  nombreObraEnDoc: string | null;
} {
  const lineas = texto.split('\n');

  // Extraer metadatos
  let solicitante = 'No especificado';
  let fechaPedido = new Date();
  let nombreObraEnDoc: string | null = null;

  for (const linea of lineas) {
    const ls = linea.trim();
    if (!solicitante || solicitante === 'No especificado') {
      const mSol = ls.match(/solicitante[:\s]+(.+)/i);
      if (mSol) solicitante = mSol[1].trim();
    }
    if (!nombreObraEnDoc) {
      const mObra = ls.match(/obra[:\s]+(.+)/i);
      if (mObra) nombreObraEnDoc = mObra[1].trim();
    }
    const mFecha = ls.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (mFecha) {
      const [, dia, mes, anio] = mFecha;
      const year = anio.length === 2 ? 2000 + parseInt(anio) : parseInt(anio);
      fechaPedido = new Date(year, parseInt(mes) - 1, parseInt(dia));
    }
  }

  // Extraer items: <nro> <cantidad>[unidad] [unidad] <descripcion>
  const items: ItemExtraido[] = [];

  for (const linea of lineas) {
    const tokens = linea.trim().split(/\s+/);
    if (tokens.length < 3) continue;

    // Token 0: número de ítem (solo dígitos)
    if (!/^\d+$/.test(tokens[0])) continue;
    const numeroItem = parseInt(tokens[0]);

    // Token 1: cantidad (número + unidad opcional pegada)
    const mCant = tokens[1].match(/^(\d+(?:[.,]\d+)?)([a-zA-Z]*)$/);
    if (!mCant) continue;
    const [, cantNum, unidadPegada] = mCant;

    // Token 2: ¿es unidad separada?
    let unidad = unidadPegada;
    let descStart = 2;

    if (!unidadPegada && tokens.length > 3 && RE_UNIDAD.test(tokens[2])) {
      unidad = tokens[2];
      descStart = 3;
    }

    const descripcion = tokens.slice(descStart).join(' ').trim();
    if (!descripcion) continue;

    const cantidadNorm = parseFloat(cantNum.replace(',', '.'));
    const cantidadOrig = unidad ? `${cantNum}${unidad}` : cantNum;

    items.push({
      numeroItem,
      textoOriginal: linea.trim(),
      cantidadOriginal: cantidadOrig,
      cantidadNormalizada: cantidadNorm,
      unidadPedido: unidad || 'u',
      descripcion,
    });
  }

  return { solicitante, fechaPedido, items, nombreObraEnDoc };
}

@Injectable()
export class PedidosService {
  constructor(
    private readonly repo: PedidosRepository,
    private readonly pdfExtractor: PdfExtractorService,
    private readonly imageExtractor: ImageExtractorService,
    private readonly ocrService: OcrService,
    private readonly pedidoResolver: PedidoResolverService,
    private readonly obrasService: ObrasService,
  ) {}

  findAll(filtros?: { obraId?: string; estado?: string }) {
    return this.repo.findAll(filtros);
  }

  async findById(id: string) {
    const pedido = await this.repo.findById(id);
    if (!pedido) throw new NotFoundException('PEDIDO_NOT_FOUND');
    return pedido;
  }

  async create(archivo: Express.Multer.File, obraId: string) {
    // 1. Validar obra
    const obra = await this.obrasService.findById(obraId);
    if (!obra.activa) throw new UnprocessableEntityException('OBRA_INACTIVA');

    const advertencias: string[] = [];
    let solicitante: string;
    let fechaPedido: Date;
    let nombreObraEnDoc: string | null;
    let items: ItemExtraido[];
    let tipoArchivo: TipoArchivo;

    // 2. Extraer y parsear según tipo de archivo
    if (archivo.mimetype === 'application/pdf') {
      tipoArchivo = TipoArchivo.PDF;
      const resultado: PdfParsedResult = await this.pdfExtractor.extract(archivo.buffer);
      solicitante = resultado.solicitante;
      fechaPedido = resultado.fechaPedido;
      nombreObraEnDoc = resultado.obra;
      items = resultado.items;
      advertencias.push(...resultado.advertencias);
    } else {
      tipoArchivo = TipoArchivo.IMAGEN;
      const imgBuffer = this.imageExtractor.validar(archivo);
      const ocrResult = await this.ocrService.recognizeText(imgBuffer);
      if (ocrResult.esMock) advertencias.push('OCR_PENDIENTE_CALIBRACION');
      const parsed = parsearDocumento(ocrResult.text);
      solicitante = parsed.solicitante;
      fechaPedido = parsed.fechaPedido;
      nombreObraEnDoc = parsed.nombreObraEnDoc;
      items = parsed.items;
    }

    if (items.length === 0) {
      throw new BadRequestException(
        tipoArchivo === TipoArchivo.PDF ? 'PDF_SIN_ITEMS' : 'OCR_SIN_RESULTADO',
      );
    }

    // 3. Advertencia por discrepancia de obra
    if (
      nombreObraEnDoc &&
      !obra.nombre.toLowerCase().includes(nombreObraEnDoc.toLowerCase()) &&
      !nombreObraEnDoc.toLowerCase().includes(obra.nombre.toLowerCase())
    ) {
      advertencias.push(
        `DISCREPANCIA_OBRA: documento indica "${nombreObraEnDoc}", obra seleccionada es "${obra.nombre}"`,
      );
    }

    // 4. Resolver items contra catálogo
    const itemsResueltos = await this.pedidoResolver.resolverItems(items);

    // 5. Persistir
    const pedido = await this.repo.create({
      obraId,
      solicitante,
      fechaPedido,
      archivoOriginal: archivo.originalname,
      tipoArchivo,
      items: itemsResueltos,
    });

    return { ...pedido, advertencias };
  }

  async actualizarItem(pedidoId: string, itemId: string, dto: ActualizarItemDto) {
    const pedido = await this.repo.findById(pedidoId);
    if (!pedido) throw new NotFoundException('PEDIDO_NOT_FOUND');

    const item = pedido.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('ITEM_NOT_FOUND');

    return this.repo.updateItem(itemId, {
      materialId: dto.materialId,
      estadoResolucion: EstadoResolucion.RESUELTO_AUTOMATICO,
      confirmadoPor: dto.confirmadoPor,
    });
  }

  async confirmar(id: string, confirmadoPor?: string) {
    const pedido = await this.repo.findById(id);
    if (!pedido) throw new NotFoundException('PEDIDO_NOT_FOUND');

    if (pedido.estado === 'CONFIRMADO' || pedido.estado === 'REMITO_GENERADO') {
      throw new UnprocessableEntityException('PEDIDO_YA_CONFIRMADO');
    }

    const sinResolver = pedido.items.filter(
      (i) => i.estadoResolucion !== EstadoResolucion.RESUELTO_AUTOMATICO,
    );

    if (sinResolver.length > 0) {
      throw new UnprocessableEntityException('ITEMS_SIN_RESOLVER');
    }

    // Actualizar confirmadoPor en los items que no lo tengan
    if (confirmadoPor) {
      await Promise.all(
        pedido.items
          .filter((i) => !i.confirmadoPor)
          .map((i) =>
            this.repo.updateItem(i.id, {
              materialId: i.materialId!,
              estadoResolucion: EstadoResolucion.RESUELTO_AUTOMATICO,
              confirmadoPor,
            }),
          ),
      );
    }

    return this.repo.confirmar(id);
  }
}
