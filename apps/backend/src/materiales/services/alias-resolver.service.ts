import { Injectable } from '@nestjs/common';
import Fuse from 'fuse.js';
import { AliasRepository } from '../repositories/alias.repository';
import {
  EstadoResolucion,
  ICandidatoMaterial,
  IResolverResultado,
} from '../interfaces/resolver-resultado.interface';

const FUZZY_THRESHOLD = 0.4;
const MAX_CANDIDATOS = 5;

@Injectable()
export class AliasResolverService {
  constructor(private readonly aliasRepo: AliasRepository) {}

  async resolver(texto: string): Promise<IResolverResultado> {
    const textoNormalizado = this.normalizar(texto);

    const todosLosAlias = await this.aliasRepo.findAll();

    const aliasConNormalizado = todosLosAlias.map((a) => ({
      ...a,
      textoNormalizado: this.normalizar(a.texto),
    }));

    const exacto = aliasConNormalizado.find(
      (a) => a.textoNormalizado === textoNormalizado,
    );

    if (exacto) {
      return {
        estado: 'RESUELTO_AUTOMATICO' as EstadoResolucion,
        material: exacto.material,
        candidatos: [],
        score: 1,
        textoNormalizado,
      };
    }

    type AliasEntry = (typeof aliasConNormalizado)[number];
    const fuse = new Fuse<AliasEntry>(aliasConNormalizado, {
      keys: ['textoNormalizado'],
      threshold: FUZZY_THRESHOLD,
      includeScore: true,
    });

    const resultados = fuse.search(textoNormalizado);

    if (resultados.length > 0) {
      const candidatos: ICandidatoMaterial[] = resultados
        .slice(0, MAX_CANDIDATOS)
        .map((r) => ({
          material: r.item.material,
          score: 1 - (r.score ?? 1),
          aliasCoincidente: r.item.texto,
        }));

      return {
        estado: 'PENDIENTE_CONFIRMACION' as EstadoResolucion,
        material: candidatos[0].material,
        candidatos,
        score: candidatos[0].score,
        textoNormalizado,
      };
    }

    return {
      estado: 'SIN_MATCH' as EstadoResolucion,
      material: null,
      candidatos: [],
      score: null,
      textoNormalizado,
    };
  }

  // Exportado para que otros servicios puedan normalizar antes de guardar alias
  normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/½/g, '1/2')
      .replace(/¼/g, '1/4')
      .replace(/¾/g, '3/4')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
