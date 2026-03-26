import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { HistoricoCustoItem, Ingrediente } from '../models';

@Injectable({
  providedIn: 'root',
})
export class IngredienteService extends ApiService {

  listar(apenasAtivos = true): Observable<Ingrediente[]> {
    return this.get<Ingrediente[]>('/ingredientes/', { apenas_ativos: apenasAtivos });
  }

  buscarPorId(id: string): Observable<Ingrediente> {
    return this.get<Ingrediente>(`/ingredientes/${id}`);
  }

  criar(dados: Partial<Ingrediente>): Observable<Ingrediente> {
    return this.post<Ingrediente>('/ingredientes/', dados);
  }

  atualizar(id: string, dados: Partial<Ingrediente>): Observable<Ingrediente> {
    return this.patch<Ingrediente>(`/ingredientes/${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`/ingredientes/${id}`);
  }

  buscarHistoricoCusto(id: string, limit = 30): Observable<HistoricoCustoItem[]> {
    return this.get<HistoricoCustoItem[]>(`/ingredientes/${id}/historico-custo`, { limit });
  }
}