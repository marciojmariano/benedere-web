import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Markup } from '../models';

@Injectable({ providedIn: 'root' })
export class MarkupService extends ApiService {
  listar(apenasAtivos = true): Observable<Markup[]> {
    return this.get<Markup[]>('/markups/', { apenas_ativos: apenasAtivos });
  }

  buscarPorId(id: string): Observable<Markup> {
    return this.get<Markup>(`/markups/${id}`);
  }

  criar(dados: Partial<Markup>): Observable<Markup> {
    return this.post<Markup>('/markups/', dados);
  }

  atualizar(id: string, dados: Partial<Markup>): Observable<Markup> {
    return this.patch<Markup>(`/markups/${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`/markups/${id}`);
  }
}