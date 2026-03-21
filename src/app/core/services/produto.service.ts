import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Produto, ProdutoDetalhe, ProdutoComposicao } from '../models';

export interface ProdutoComposicaoCreate {
  ingrediente_id: string;
  quantidade_g: number;
  ordem: number;
}

export interface ProdutoCreate {
  nome: string;
  tipo_refeicao?: string | null;
  descricao?: string | null;
  composicao?: ProdutoComposicaoCreate[];
}

@Injectable({
  providedIn: 'root',
})
export class ProdutoService extends ApiService {

  listar(apenasAtivos = true): Observable<Produto[]> {
    return this.get<Produto[]>('/produtos/', { apenas_ativos: apenasAtivos });
  }

  buscarPorId(id: string): Observable<ProdutoDetalhe> {
    return this.get<ProdutoDetalhe>(`/produtos/${id}`);
  }

  criar(dados: ProdutoCreate): Observable<Produto> {
    return this.post<Produto>('/produtos/', dados);
  }

  atualizar(id: string, dados: Partial<ProdutoCreate>): Observable<Produto> {
    return this.patch<Produto>(`/produtos/${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`/produtos/${id}`);
  }

  reativar(id: string): Observable<Produto> {
    return this.patch<Produto>(`/produtos/${id}/reativar`, {});
  }

  // ── Composição ──────────────────────────────────────────────────────────

  listarComposicao(produtoId: string): Observable<ProdutoComposicao[]> {
    return this.get<ProdutoComposicao[]>(`/produtos/${produtoId}/composicao`);
  }

  substituirComposicao(produtoId: string, composicao: ProdutoComposicaoCreate[]): Observable<Produto> {
    return this.put<Produto>(`/produtos/${produtoId}/composicao`, composicao);
  }

  // PUT não existe no ApiService base — adicionar
  private put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }
}
