import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Nutricionista } from '../models';

@Injectable({ providedIn: 'root' })
export class NutricionistaService extends ApiService {

  listar(apenasAtivos = true): Observable<Nutricionista[]> {
    return this.get<Nutricionista[]>('/nutricionistas/', { apenas_ativos: apenasAtivos });
  }

  buscarPorId(id: string): Observable<Nutricionista> {
    return this.get<Nutricionista>(`/nutricionistas/${id}`);
  }

  criar(dados: Partial<Nutricionista>): Observable<Nutricionista> {
    return this.post<Nutricionista>('/nutricionistas/', dados);
  }

  atualizar(id: string, dados: Partial<Nutricionista>): Observable<Nutricionista> {
    return this.patch<Nutricionista>(`/nutricionistas/${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`/nutricionistas/${id}`);
  }
}