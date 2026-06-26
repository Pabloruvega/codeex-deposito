export interface IStockItem {
  id: string;
  obraId: string;
  proveedor: string;
  materialId: string;
  cantidad: number;
  material?: {
    id: string;
    nombreOficial: string;
    unidadStock: string;
    categoria: string;
  };
}
