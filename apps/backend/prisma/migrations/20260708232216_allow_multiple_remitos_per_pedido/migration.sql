-- DropIndex
DROP INDEX "RemitoSalida_pedidoId_key";

-- CreateIndex
CREATE INDEX "RemitoSalida_pedidoId_idx" ON "RemitoSalida"("pedidoId");
