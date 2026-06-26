export interface IObra {
  id: string;
  nombre: string;
  activa: boolean;
}

export interface IObraProveedor {
  id: string;
  obraId: string;
  proveedor: string;
  spreadsheetIdStock: string;
  spreadsheetIdControl: string;
  activo: boolean;
}
