-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ObraProveedor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "spreadsheetIdStock" TEXT NOT NULL,
    "spreadsheetIdControl" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "ObraProveedor_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigoProveedor" TEXT,
    "nombreOficial" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidadStock" TEXT NOT NULL,
    "unidadPedido" TEXT NOT NULL,
    "longitudEstandar" REAL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "creadoPor" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alias_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "solicitante" TEXT NOT NULL,
    "fechaPedido" DATETIME NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivoOriginal" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE_REVISION',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Pedido_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "numeroItem" INTEGER NOT NULL,
    "textoOriginal" TEXT NOT NULL,
    "cantidadOriginal" TEXT NOT NULL,
    "cantidadNormalizada" REAL NOT NULL,
    "unidadPedido" TEXT NOT NULL,
    "materialId" TEXT,
    "estadoResolucion" TEXT NOT NULL DEFAULT 'SIN_MATCH',
    "scoreResolucion" REAL,
    "observaciones" TEXT,
    "confirmadoPor" TEXT,
    "confirmadoEn" DATETIME,
    CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemPedido_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemitoSalida" (
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
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RemitoSalida_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RemitoSalida_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemRemito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoId" TEXT NOT NULL,
    "itemPedidoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidadPedida" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "cantidadEnStock" REAL NOT NULL,
    "cantidadFaltante" REAL NOT NULL DEFAULT 0,
    "condicionEntrega" TEXT,
    "observaciones" TEXT,
    CONSTRAINT "ItemRemito_remitoId_fkey" FOREIGN KEY ("remitoId") REFERENCES "RemitoSalida" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemRemito_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "ItemPedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemRemito_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemitoEntrada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "numeroRemito" TEXT NOT NULL,
    "fechaRemito" DATETIME NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asociadoARecepcion" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ItemRemitoEntrada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoEntradaId" TEXT NOT NULL,
    "codigoProveedor" TEXT NOT NULL,
    "descripcionProveedor" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "unidad" TEXT,
    "materialId" TEXT,
    CONSTRAINT "ItemRemitoEntrada_remitoEntradaId_fkey" FOREIGN KEY ("remitoEntradaId") REFERENCES "RemitoEntrada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recepcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "numeroRemito" TEXT NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "fechaRemito" DATETIME NOT NULL,
    "fechaRecepcion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'COMPLETA',
    CONSTRAINT "Recepcion_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemRecepcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recepcionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "descripcionProveedor" TEXT NOT NULL,
    "codigoProveedor" TEXT NOT NULL,
    "cantidadFacturada" REAL NOT NULL,
    "cantidadRecibida" REAL NOT NULL,
    "diferencia" REAL NOT NULL,
    "tieneFaltante" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ItemRecepcion_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "Recepcion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemRecepcion_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FaltanteProveedor" (
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
    CONSTRAINT "FaltanteProveedor_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "Recepcion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FaltanteObra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoSalidaId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidadPedida" REAL NOT NULL,
    "cantidadFaltante" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedoEn" DATETIME,
    CONSTRAINT "FaltanteObra_remitoSalidaId_fkey" FOREIGN KEY ("remitoSalidaId") REFERENCES "RemitoSalida" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FaltanteObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FaltanteObra_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ObraProveedor_obraId_proveedor_key" ON "ObraProveedor"("obraId", "proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_texto_key" ON "Alias"("texto");

-- CreateIndex
CREATE UNIQUE INDEX "RemitoSalida_pedidoId_key" ON "RemitoSalida"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "RemitoSalida_numeroRemito_key" ON "RemitoSalida"("numeroRemito");

-- CreateIndex
CREATE UNIQUE INDEX "ItemRemito_itemPedidoId_key" ON "ItemRemito"("itemPedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "RemitoEntrada_obraId_proveedor_numeroRemito_key" ON "RemitoEntrada"("obraId", "proveedor", "numeroRemito");
