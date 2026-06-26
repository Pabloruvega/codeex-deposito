import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

function buildClient() {
  const url = process.env.DATABASE_URL;
  if (!url)
    throw new Error(
      'DATABASE_URL no está definida en las variables de entorno',
    );
  const adapter = new PrismaLibSql({ url });

  return new PrismaClient({ adapter });
}

const prisma = buildClient();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client = prisma;

  get material() {
    return this.client.material;
  }

  get alias() {
    return this.client.alias;
  }
  get obra() {
    return this.client.obra;
  }
  get obraProveedor() {
    return this.client.obraProveedor;
  }
  get pedido() {
    return this.client.pedido;
  }
  get itemPedido() {
    return this.client.itemPedido;
  }
  get remitoSalida() {
    return this.client.remitoSalida;
  }
  get itemRemito() {
    return this.client.itemRemito;
  }
  get remitoEntrada() {
    return this.client.remitoEntrada;
  }
  get itemRemitoEntrada() {
    return this.client.itemRemitoEntrada;
  }
  get recepcion() {
    return this.client.recepcion;
  }
  get itemRecepcion() {
    return this.client.itemRecepcion;
  }
  get faltanteProveedor() {
    return this.client.faltanteProveedor;
  }
  get faltanteObra() {
    return this.client.faltanteObra;
  }
  get stockItem() {
    return this.client.stockItem;
  }
  get syncLog() {
    return this.client.syncLog;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
