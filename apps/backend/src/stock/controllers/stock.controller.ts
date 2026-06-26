import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { DescuentoStockDto } from '../dto/descuento-stock.dto';
import { IngresoStockDto } from '../dto/stock-item.dto';

@Controller('stock')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get(':obraId/:proveedor')
  getStockObra(
    @Param('obraId') obraId: string,
    @Param('proveedor') proveedor: string,
  ) {
    return this.service.getStockObra(obraId, proveedor);
  }

  @Get(':obraId/:proveedor/:materialId')
  getStockMaterial(
    @Param('obraId') obraId: string,
    @Param('proveedor') proveedor: string,
    @Param('materialId') materialId: string,
  ) {
    return this.service.getStockMaterial(obraId, proveedor, materialId);
  }

  @Post(':obraId/:proveedor/descuento')
  descuento(
    @Param('obraId') obraId: string,
    @Param('proveedor') proveedor: string,
    @Body() dto: DescuentoStockDto,
  ) {
    return this.service.descontar(obraId, proveedor, dto);
  }

  @Post(':obraId/:proveedor/ingreso')
  ingreso(
    @Param('obraId') obraId: string,
    @Param('proveedor') proveedor: string,
    @Body() dto: IngresoStockDto,
  ) {
    return this.service.ingresar(obraId, proveedor, dto);
  }
}
