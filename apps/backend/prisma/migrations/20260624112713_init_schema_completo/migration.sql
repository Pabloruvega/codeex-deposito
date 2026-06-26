/*
  Warnings:

  - You are about to drop the column `resolvedoEn` on the `FaltanteObra` table. All the data in the column will be lost.
  - You are about to drop the column `confirmadoEn` on the `ItemPedido` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `ItemPedido` table. All the data in the column will be lost.
  - You are about to drop the column `itemPedidoId` on the `ItemRemito` table. All the data in the column will be lost.
  - You are about to drop the column `actualizadoEn` on the `Obra` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `Obra` table. All the data in the column will be lost.
  - You are about to drop the column `actualizadoEn` on the `ObraProveedor` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `ObraProveedor` table. All the data in the column will be lost.
  - You are about to drop the column `actualizadoEn` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `RemitoSalida` table. All the data in the column will be lost.
  - Added the required column `itemRemitoId` to the `FaltanteObra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoArchivo` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'EN_PROCESO',
    "productosActualizados" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "creadoPor" TEXT NOT NULL DEFAULT 'SISTEMA',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alias_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Alias" ("creadoEn", "creadoPor", "id", "materialId", "texto") SELECT "creadoEn", "creadoPor", "id", "materialId", "texto" FROM "Alias";
DROP TABLE "Alias";
ALTER TABLE "new_Alias" RENAME TO "Alias";
CREATE UNIQUE INDEX "Alias_texto_key" ON "Alias"("texto");
CREATE TABLE "new_FaltanteObra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoSalidaId" TEXT NOT NULL,
    "itemRemitoId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidadPedida" REAL NOT NULL,
    "cantidadFaltante" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltaEn" DATETIME,
    CONSTRAINT "FaltanteObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FaltanteObra_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FaltanteObra_itemRemitoId_fkey" FOREIGN KEY ("itemRemitoId") REFERENCES "ItemRemito" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FaltanteObra" ("cantidadFaltante", "cantidadPedida", "creadoEn", "descripcion", "estado", "id", "materialId", "obraId", "observaciones", "remitoSalidaId", "unidad") SELECT "cantidadFaltante", "cantidadPedida", "creadoEn", "descripcion", "estado", "id", "materialId", "obraId", "observaciones", "remitoSalidaId", "unidad" FROM "FaltanteObra";
DROP TABLE "FaltanteObra";
ALTER TABLE "new_FaltanteObra" RENAME TO "FaltanteObra";
CREATE UNIQUE INDEX "FaltanteObra_itemRemitoId_key" ON "FaltanteObra"("itemRemitoId");
CREATE TABLE "new_FaltanteProveedor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recepcionId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "numeroRemito" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "cantidadFacturada" REAL NOT NULL,
    "cantidadRecibida" REAL NOT NULL,
    "diferencia" REAL NOT NULL,
    "fechaRemito" DATETIME NOT NULL,
    "resuelto" BOOLEAN NOT NULL DEFAULT false,
    "fechaResolucion" DATETIME,
    CONSTRAINT "FaltanteProveedor_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "Recepcion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FaltanteProveedor_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FaltanteProveedor" ("cantidadFacturada", "cantidadRecibida", "diferencia", "fechaRemito", "fechaResolucion", "id", "materialId", "numeroFactura", "numeroRemito", "obraId", "proveedor", "recepcionId", "resuelto") SELECT "cantidadFacturada", "cantidadRecibida", "diferencia", "fechaRemito", "fechaResolucion", "id", "materialId", "numeroFactura", "numeroRemito", "obraId", "proveedor", "recepcionId", "resuelto" FROM "FaltanteProveedor";
DROP TABLE "FaltanteProveedor";
ALTER TABLE "new_FaltanteProveedor" RENAME TO "FaltanteProveedor";
CREATE TABLE "new_ItemPedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "numeroItem" INTEGER NOT NULL,
    "textoOriginal" TEXT NOT NULL,
    "cantidadOriginal" TEXT NOT NULL,
    "cantidadNormalizada" REAL NOT NULL,
    "unidadPedido" TEXT NOT NULL,
    "materialId" TEXT,
    "estadoResolucion" TEXT NOT NULL,
    "scoreResolucion" REAL,
    "confirmadoPor" TEXT,
    CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemPedido_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemPedido" ("cantidadNormalizada", "cantidadOriginal", "confirmadoPor", "estadoResolucion", "id", "materialId", "numeroItem", "pedidoId", "scoreResolucion", "textoOriginal", "unidadPedido") SELECT "cantidadNormalizada", "cantidadOriginal", "confirmadoPor", "estadoResolucion", "id", "materialId", "numeroItem", "pedidoId", "scoreResolucion", "textoOriginal", "unidadPedido" FROM "ItemPedido";
DROP TABLE "ItemPedido";
ALTER TABLE "new_ItemPedido" RENAME TO "ItemPedido";
CREATE TABLE "new_ItemRemito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidadPedida" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "cantidadEnStock" REAL NOT NULL,
    "cantidadFaltante" REAL NOT NULL DEFAULT 0,
    "condicionEntrega" TEXT,
    "observaciones" TEXT,
    CONSTRAINT "ItemRemito_remitoId_fkey" FOREIGN KEY ("remitoId") REFERENCES "RemitoSalida" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemRemito_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ItemRemito" ("cantidadEnStock", "cantidadFaltante", "cantidadPedida", "condicionEntrega", "descripcion", "id", "materialId", "observaciones", "remitoId", "unidad") SELECT "cantidadEnStock", "cantidadFaltante", "cantidadPedida", "condicionEntrega", "descripcion", "id", "materialId", "observaciones", "remitoId", "unidad" FROM "ItemRemito";
DROP TABLE "ItemRemito";
ALTER TABLE "new_ItemRemito" RENAME TO "ItemRemito";
CREATE TABLE "new_ItemRemitoEntrada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoEntradaId" TEXT NOT NULL,
    "codigoProveedor" TEXT NOT NULL,
    "descripcionProveedor" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "unidad" TEXT,
    "materialId" TEXT,
    CONSTRAINT "ItemRemitoEntrada_remitoEntradaId_fkey" FOREIGN KEY ("remitoEntradaId") REFERENCES "RemitoEntrada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemRemitoEntrada_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemRemitoEntrada" ("cantidad", "codigoProveedor", "descripcionProveedor", "id", "materialId", "remitoEntradaId", "unidad") SELECT "cantidad", "codigoProveedor", "descripcionProveedor", "id", "materialId", "remitoEntradaId", "unidad" FROM "ItemRemitoEntrada";
DROP TABLE "ItemRemitoEntrada";
ALTER TABLE "new_ItemRemitoEntrada" RENAME TO "ItemRemitoEntrada";
CREATE TABLE "new_Obra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Obra" ("activa", "id", "nombre") SELECT "activa", "id", "nombre" FROM "Obra";
DROP TABLE "Obra";
ALTER TABLE "new_Obra" RENAME TO "Obra";
CREATE TABLE "new_ObraProveedor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "spreadsheetIdStock" TEXT NOT NULL,
    "spreadsheetIdControl" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ObraProveedor_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ObraProveedor" ("activo", "id", "obraId", "proveedor", "spreadsheetIdControl", "spreadsheetIdStock") SELECT "activo", "id", "obraId", "proveedor", "spreadsheetIdControl", "spreadsheetIdStock" FROM "ObraProveedor";
DROP TABLE "ObraProveedor";
ALTER TABLE "new_ObraProveedor" RENAME TO "ObraProveedor";
CREATE TABLE "new_Pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "solicitante" TEXT NOT NULL,
    "fechaPedido" DATETIME NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivoOriginal" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE_REVISION',
    CONSTRAINT "Pedido_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("archivoOriginal", "estado", "fechaCarga", "fechaPedido", "id", "obraId", "solicitante") SELECT "archivoOriginal", "estado", "fechaCarga", "fechaPedido", "id", "obraId", "solicitante" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE TABLE "new_RemitoEntrada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "numeroRemito" TEXT NOT NULL,
    "fechaRemito" DATETIME NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asociadoARecepcion" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RemitoEntrada_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RemitoEntrada" ("asociadoARecepcion", "fechaCarga", "fechaRemito", "id", "numeroRemito", "obraId", "proveedor") SELECT "asociadoARecepcion", "fechaCarga", "fechaRemito", "id", "numeroRemito", "obraId", "proveedor" FROM "RemitoEntrada";
DROP TABLE "RemitoEntrada";
ALTER TABLE "new_RemitoEntrada" RENAME TO "RemitoEntrada";
CREATE TABLE "new_RemitoSalida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "numeroRemito" INTEGER NOT NULL,
    "solicitante" TEXT NOT NULL,
    "encargadoDeposito" TEXT NOT NULL,
    "encargadoTraslado" TEXT NOT NULL,
    "fechaPedidoObra" DATETIME NOT NULL,
    "fechaRetiroDeposito" DATETIME NOT NULL,
    "archivoExcel" TEXT NOT NULL,
    "estadoStock" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "intentosDescuento" INTEGER NOT NULL DEFAULT 0,
    "ultimoIntentoEn" DATETIME,
    CONSTRAINT "RemitoSalida_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RemitoSalida" ("archivoExcel", "encargadoDeposito", "encargadoTraslado", "estadoStock", "fechaPedidoObra", "fechaRetiroDeposito", "id", "intentosDescuento", "numeroRemito", "obraId", "pedidoId", "solicitante", "ultimoIntentoEn") SELECT "archivoExcel", "encargadoDeposito", "encargadoTraslado", "estadoStock", "fechaPedidoObra", "fechaRetiroDeposito", "id", "intentosDescuento", "numeroRemito", "obraId", "pedidoId", "solicitante", "ultimoIntentoEn" FROM "RemitoSalida";
DROP TABLE "RemitoSalida";
ALTER TABLE "new_RemitoSalida" RENAME TO "RemitoSalida";
CREATE UNIQUE INDEX "RemitoSalida_pedidoId_key" ON "RemitoSalida"("pedidoId");
CREATE UNIQUE INDEX "RemitoSalida_numeroRemito_key" ON "RemitoSalida"("numeroRemito");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
