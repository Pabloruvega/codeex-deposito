import { Injectable } from '@nestjs/common';

export interface ResultadoComparacion {
  diferencia: number;
  tieneFaltante: boolean;
}

@Injectable()
export class ComparadorFacturaService {
  calcular(cantidadFacturada: number, cantidadRecibida: number): ResultadoComparacion {
    const diferencia = cantidadFacturada - cantidadRecibida;
    return { diferencia, tieneFaltante: diferencia > 0 };
  }

  determinarEstado(items: Array<{ diferencia: number }>): 'COMPLETA' | 'CON_DIFERENCIAS' {
    return items.some((i) => i.diferencia > 0) ? 'CON_DIFERENCIAS' : 'COMPLETA';
  }
}
