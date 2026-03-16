import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Pedido, StatusPedido } from '../models';

@Injectable({ providedIn: 'root' })
export class PedidoService extends ApiService {

  listar(clienteId?: string, status?: StatusPedido): Observable<Pedido[]> {
    const params: any = {};
    if (clienteId) params['cliente_id'] = clienteId;
    if (status) params['status_pedido'] = status;
    return this.get<Pedido[]>('/pedidos/', params);
  }

  buscarPorId(id: string): Observable<Pedido> {
    return this.get<Pedido>(`/pedidos/${id}`);
  }

  criarDePedido(dados: any): Observable<Pedido> {
    return this.post<Pedido>('/pedidos/', dados);
  }

  atualizar(id: string, dados: any): Observable<Pedido> {
    return this.patch<Pedido>(`/pedidos/${id}`, dados);
  }

  mudarStatus(id: string, novoStatus: StatusPedido): Observable<Pedido> {
    return this.patch<Pedido>(`/pedidos/${id}/status?novo_status=${novoStatus}`, {});
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf/pedidos/${id}/download`, { responseType: 'blob' });
  }
}