import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Orcamento, StatusOrcamento } from '../models';

@Injectable({ providedIn: 'root' })
export class OrcamentoService extends ApiService {

  listar(clienteId?: string, status?: StatusOrcamento): Observable<Orcamento[]> {
    const params: any = {};
    if (clienteId) params['cliente_id'] = clienteId;
    if (status) params['status_orcamento'] = status;
    return this.get<Orcamento[]>('/orcamentos/', params);
  }

  buscarPorId(id: string): Observable<Orcamento> {
    return this.get<Orcamento>(`/orcamentos/${id}`);
  }

  criar(dados: any): Observable<Orcamento> {
    return this.post<Orcamento>('/orcamentos/', dados);
  }

  atualizar(id: string, dados: any): Observable<Orcamento> {
    return this.patch<Orcamento>(`/orcamentos/${id}`, dados);
  }

  mudarStatus(id: string, novoStatus: StatusOrcamento): Observable<Orcamento> {
    return this.patch<Orcamento>(`/orcamentos/${id}/status?novo_status=${novoStatus}`, {});
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf/orcamentos/${id}/download`, { responseType: 'blob' });
  }
}