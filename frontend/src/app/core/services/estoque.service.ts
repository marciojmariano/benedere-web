import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { EntradaEstoqueCreate, ImportacaoEstoqueResponse, MovimentacaoEstoque } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EstoqueService extends ApiService {

  registrarEntrada(dados: EntradaEstoqueCreate): Observable<MovimentacaoEstoque> {
    return this.post<MovimentacaoEstoque>('/estoque/entradas', dados);
  }

  listarMovimentacoes(limit = 50, offset = 0): Observable<MovimentacaoEstoque[]> {
    return this.get<MovimentacaoEstoque[]>('/estoque/movimentacoes', { limit, offset });
  }

  buscarPorId(id: string): Observable<MovimentacaoEstoque> {
    return this.get<MovimentacaoEstoque>(`/estoque/movimentacoes/${id}`);
  }

  listarPorIngrediente(ingredienteId: string, limit = 50, offset = 0): Observable<MovimentacaoEstoque[]> {
    return this.get<MovimentacaoEstoque[]>(
      `/estoque/ingredientes/${ingredienteId}/movimentacoes`,
      { limit, offset },
    );
  }

  importarExcel(arquivo: File): Observable<ImportacaoEstoqueResponse> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.postFormData<ImportacaoEstoqueResponse>('/estoque/entradas/importar', formData);
  }
}
