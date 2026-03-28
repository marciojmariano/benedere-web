import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { BulkLabelItem, Pedido, PedidoResumo, StatusPedido } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PedidoService extends ApiService {

  listar(status?: StatusPedido, clienteId?: string): Observable<PedidoResumo[]> {
    const params: Record<string, any> = {};
    if (status) params['status'] = status;
    if (clienteId) params['cliente_id'] = clienteId;
    return this.get<PedidoResumo[]>('/pedidos/', params);
  }

  buscarPorId(id: string): Observable<Pedido> {
    return this.get<Pedido>(`/pedidos/${id}`);
  }

  criar(dados: { cliente_id: string; markup_id?: string; observacoes?: string }): Observable<Pedido> {
    return this.post<Pedido>('/pedidos/', dados);
  }

  atualizar(id: string, dados: Partial<{ observacoes: string; data_entrega_prevista: string }>): Observable<Pedido> {
    return this.patch<Pedido>(`/pedidos/${id}`, dados);
  }

  deletar(id: string): Observable<void> {
    return this.delete<void>(`/pedidos/${id}`);
  }

  mudarStatus(id: string, status: StatusPedido): Observable<Pedido> {
    return this.patch<Pedido>(`/pedidos/${id}/status`, { status });
  }

  adicionarItem(pedidoId: string, item: any): Observable<Pedido> {
    return this.post<Pedido>(`/pedidos/${pedidoId}/itens`, item);
  }

  removerItem(pedidoId: string, itemId: string): Observable<Pedido> {
    return this.delete<Pedido>(`/pedidos/${pedidoId}/itens/${itemId}`);
  }

  duplicar(id: string): Observable<Pedido> {
    return this.post<Pedido>(`/pedidos/${id}/duplicar`, {});
  }

  bulkLabelData(pedidoIds: string[]): Observable<BulkLabelItem[]> {
    return this.post<BulkLabelItem[]>('/pedidos/bulk-label-data', { pedido_ids: pedidoIds });
  }

  marcarImpressas(itemIds: string[]): Observable<{ marcados: number }> {
    return this.patch<{ marcados: number }>('/pedidos/marcar-impressas', { item_ids: itemIds });
  }
}
