export class RemitoGeneradoDto {
  id: string;
  numeroRemito: number;
  numeroRemitoStr: string;
  pedidoId: string;
  obraId: string;
  solicitante: string;
  encargadoDeposito: string;
  encargadoTraslado: string;
  fechaPedidoObra: Date;
  fechaRetiroDeposito: Date;
  archivoExcel: string;
  estadoStock: string;
  advertencias: string[];
  items: ItemRemitoGeneradoDto[];
}

export class ItemRemitoGeneradoDto {
  id: string;
  materialId: string;
  descripcion: string;
  cantidadPedida: number;
  unidad: string;
  cantidadEnStock: number;
  cantidadFaltante: number;
  observaciones?: string;
}
