import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Cliente } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ClienteService extends ApiService {

  listar(apenasAtivos = true): Observable<Cliente[]> {
    return this.get<Cliente[]>('/clientes/', { apenas_ativos: apenasAtivos });
  }

  buscarPorId(id: string): Observable<Cliente> {
    return this.get<Cliente>(`/clientes/${id}`);
  }

  criar(dados: Partial<Cliente>): Observable<Cliente> {
    return this.post<Cliente>('/clientes/', dados);
  }

  atualizar(id: string, dados: Partial<Cliente>): Observable<Cliente> {
    return this.patch<Cliente>(`/clientes/${id}`, dados);
  }

  desativar(id: string): Observable<void> {
    return this.delete<void>(`/clientes/${id}`);
  }
}