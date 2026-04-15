import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IndiceMarkup } from '../models';

@Injectable({ providedIn: 'root' })
export class IndiceMarkupService extends ApiService {

  listar(apenasAtivos = true): Observable<IndiceMarkup[]> {
    return this.get<IndiceMarkup[]>('/indices-markup/', { apenas_ativos: apenasAtivos });
  }

  buscarPorId(id: string): Observable<IndiceMarkup> {
    return this.get<IndiceMarkup>(`/indices-markup/${id}`);
  }

  criar(dados: Partial<IndiceMarkup>): Observable<IndiceMarkup> {
    return this.post<IndiceMarkup>('/indices-markup/', dados);
  }

  atualizar(id: string, dados: Partial<IndiceMarkup>): Observable<IndiceMarkup> {
    return this.patch<IndiceMarkup>(`/indices-markup/${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`/indices-markup/${id}`);
  }
}