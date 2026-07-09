-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemRemito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remitoId" TEXT NOT NULL,
    "materialId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidadPedida" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "cantidadEnStock" REAL NOT NULL,
    "cantidadFaltante" REAL NOT NULL DEFAULT 0,
    "condicionEntrega" TEXT,
    "observaciones" TEXT,
    CONSTRAINT "ItemRemito_remitoId_fkey" FOREIGN KEY ("remitoId") REFERENCES "RemitoSalida" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemRemito_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemRemito" ("cantidadEnStock", "cantidadFaltante", "cantidadPedida", "condicionEntrega", "descripcion", "id", "materialId", "observaciones", "remitoId", "unidad") SELECT "cantidadEnStock", "cantidadFaltante", "cantidadPedida", "condicionEntrega", "descripcion", "id", "materialId", "observaciones", "remitoId", "unidad" FROM "ItemRemito";
DROP TABLE "ItemRemito";
ALTER TABLE "new_ItemRemito" RENAME TO "ItemRemito";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
