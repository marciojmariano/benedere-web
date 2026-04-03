import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import { Pedido, PedidoResumo, StatusPedido } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PedidoService extends ApiService {

  // 1. Criamos o "cofre" de dados (Sinal Privado)
  private _pedidos = signal<PedidoResumo[]>([]);

  // 2. Expomos os dados para quem quiser ler
  public pedidos = this._pedidos.asReadonly();


  listar(status?: StatusPedido, clienteId?: string): Observable<PedidoResumo[]> {
    const params: Record<string, any> = {};
    if (status) params['status'] = status;
    if (clienteId) params['cliente_id'] = clienteId;
    return this.get<PedidoResumo[]>('/pedidos/', params).pipe(tap(dados => this._pedidos.set(dados))
    );
  }

  // 📦 FUNÇÃO : Conta a quantidade (ignorando cancelados) de acordo com o status
  contarPedidos(status?: string): number {
    return this.pedidos()
      .filter(p => {
        const s = p.status.toLowerCase();
        // Mantemos a MESMA regra de negócio: cancelado não conta no "Geral"
        if (s === 'cancelado') return false;
        if (!status || status === 'todos') return true;
        return s === status.toLowerCase();
      }).length; // Aqui apenas pegamos o tamanho da lista filtrada
  }

  // 💰 FUNÇÃO 2: Soma o faturamento (ignorando cancelados) de acordo com o status
  calcularValorTotal(status?: string): number {
  return this.pedidos()
      .filter(p => {
      const s = p.status.toLowerCase();
      // 1. Se o pedido for cancelado, ele NUNCA entra na conta (regra de ouro)
      if (s === 'cancelado') return false;
      
      // 2. Se não passou status (ou for 'todos'), agora ele passa (desde que não seja cancelado)
      if (!status || status === 'todos') return true;
      
      // 3. Se passou um status específico (ex: 'entregue'), filtra por ele
      return s === status.toLowerCase();
    })
    .reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0);
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




}
