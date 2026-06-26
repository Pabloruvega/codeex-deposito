import { Injectable, NotFoundException } from '@nestjs/common';
import { ObrasRepository } from '../repositories/obras.repository';
import { CreateObraDto } from '../dto/create-obra.dto';
import { UpdateObraDto } from '../dto/update-obra.dto';

@Injectable()
export class ObrasService {
  constructor(private readonly repo: ObrasRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const obra = await this.repo.findById(id);
    if (!obra) throw new NotFoundException('OBRA_NOT_FOUND');
    return obra;
  }

  create(dto: CreateObraDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateObraDto) {
    await this.findById(id);
    return this.repo.update(id, dto);
  }
}
