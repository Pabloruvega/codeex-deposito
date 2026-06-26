import { Injectable } from '@nestjs/common';
import { AliasResolverService } from '../../materiales/services/alias-resolver.service';
import { EstadoResolucion } from '@prisma/client';

export interface ItemExtraido {
  numeroItem: number;
  textoOriginal: string;
  cantidadOriginal: string;
  cantidadNormalizada: number;
  unidadPedido: string;
  descripcion: string;
}

export interface ItemResuelto {
  numeroItem: number;
  textoOriginal: string;
  cantidadOriginal: string;
  cantidadNormalizada: number;
  unidadPedido: string;
  materialId: string | null;
  estadoResolucion: EstadoResolucion;
  scoreResolucion: number | null;
}

@Injectable()
export class PedidoResolverService {
  constructor(private readonly aliasResolver: AliasResolverService) {}

  async resolverItems(items: ItemExtraido[]): Promise<ItemResuelto[]> {
    return Promise.all(
      items.map(async (item) => {
        const resultado = await this.aliasResolver.resolver(item.descripcion);
        return {
          numeroItem: item.numeroItem,
          textoOriginal: item.textoOriginal,
          cantidadOriginal: item.cantidadOriginal,
          cantidadNormalizada: item.cantidadNormalizada,
          unidadPedido: item.unidadPedido,
          materialId: resultado.material?.id ?? null,
          estadoResolucion: resultado.estado as EstadoResolucion,
          scoreResolucion: resultado.score,
        };
      }),
    );
  }
}
