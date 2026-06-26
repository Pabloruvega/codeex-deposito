export interface ResultadoItemDescuento {
  materialId: string;
  cantidadDescontada: number;
  stockResultante: number;
  stockNegativo: boolean;
}

export interface ResultadoDescuento {
  procesados: number;
  advertencias: string[];
  items: ResultadoItemDescuento[];
}

export interface ResultadoItemIngreso {
  materialId: string;
  cantidadIngresada: number;
  stockResultante: number;
}

export interface ResultadoIngreso {
  procesados: number;
  items: ResultadoItemIngreso[];
}
