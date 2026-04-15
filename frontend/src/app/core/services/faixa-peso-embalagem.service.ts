import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { FaixaPesoEmbalagem } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FaixaPesoEmbalagemService extends ApiService {
  private readonly path = '/faixas-peso-embalagem/';

  listar(): Observable<FaixaPesoEmbalagem[]> {
    return this.get<FaixaPesoEmbalagem[]>(this.path);
  }

  buscarPorId(id: string): Observable<FaixaPesoEmbalagem> {
    return this.get<FaixaPesoEmbalagem>(`${this.path}${id}`);
  }

  criar(dados: {
    peso_min_g: number;
    peso_max_g: number;
    ingrediente_embalagem_id: string;
  }): Observable<FaixaPesoEmbalagem> {
    return this.post<FaixaPesoEmbalagem>(this.path, dados);
  }

  atualizar(
    id: string,
    dados: Partial<{
      peso_min_g: number;
      peso_max_g: number;
      ingrediente_embalagem_id: string;
    }>
  ): Observable<FaixaPesoEmbalagem> {
    return this.patch<FaixaPesoEmbalagem>(`${this.path}${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`${this.path}${id}`);
  }
}
