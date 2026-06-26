import { Module } from '@nestjs/common';
import { MateriaisController } from './controllers/materiales.controller';
import { AliasController } from './controllers/alias.controller';
import { MateriaisService } from './services/materiales.service';
import { AliasService } from './services/alias.service';
import { AliasResolverService } from './services/alias-resolver.service';
import { MateriaisRepository } from './repositories/materiales.repository';
import { AliasRepository } from './repositories/alias.repository';

@Module({
  controllers: [MateriaisController, AliasController],
  providers: [
    MateriaisService,
    AliasService,
    AliasResolverService,
    MateriaisRepository,
    AliasRepository,
  ],
  exports: [MateriaisService, AliasResolverService],
})
export class MaterialesModule {}
