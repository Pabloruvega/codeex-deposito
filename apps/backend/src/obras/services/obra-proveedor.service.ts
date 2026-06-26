import { Injectable, NotFoundException } from '@nestjs/common';
import { ObraProveedorRepository } from '../repositories/obra-proveedor.repository';
import { ObrasRepository } from '../repositories/obras.repository';
import { CreateObraProveedorDto } from '../dto/create-obra-proveedor.dto';

@Injectable()
export class ObraProveedorService {
  constructor(
    private readonly repo: ObraProveedorRepository,
    private readonly obrasRepo: ObrasRepository,
  ) {}

  async findByObra(obraId: string) {
    const obra = await this.obrasRepo.findById(obraId);
    if (!obra) throw new NotFoundException('OBRA_NOT_FOUND');
    return this.repo.findByObra(obraId);
  }

  async create(obraId: string, dto: CreateObraProveedorDto) {
    const obra = await this.obrasRepo.findById(obraId);
    if (!obra) throw new NotFoundException('OBRA_NOT_FOUND');
    return this.repo.create(obraId, dto);
  }

  async desactivar(id: string) {
    const proveedor = await this.repo.findById(id);
    if (!proveedor) throw new NotFoundException('PROVEEDOR_NOT_FOUND');
    return this.repo.desactivar(id);
  }
}
