import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../core/services/pedido.service';
import { PedidoResumo, StatusPedido, STATUS_PEDIDO_LABELS } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { IconComponent } from '../../shared/components/icon.component';
import { KpiCardComponent } from '../../shared/components/kpi-card.component';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule, InputTextModule,
    PageHeaderComponent, StatusBadgeComponent, CurrencyBrlPipe, IconComponent, KpiCardComponent
  ],
  providers: [MessageService],
  templateUrl: './pedidos-list.component.html',
})
export class PedidosListComponent implements OnInit {
  private service = inject(PedidoService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  pedidos: PedidoResumo[] = [];
  loading = false;
  statusFiltro: StatusPedido | null = null;

  statusOptions = Object.values(StatusPedido);
  statusLabels = STATUS_PEDIDO_LABELS;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar(this.statusFiltro || undefined).subscribe({
      next: (data) => { this.pedidos = data; this.loading = false; },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pedidos' });
        this.loading = false;
      },
    });
  }

  toggleStatus(status: StatusPedido): void {
    this.statusFiltro = this.statusFiltro === status ? null : status;
    this.carregar();
  }

  // KPIs
  get totalPedidosAtivos(): number {
    return this.pedidos.filter(p => p.status.toLowerCase() !== 'cancelado').length;
  }
  get pedidosRascunhos(): number { return this.pedidos.filter(p => p.status === StatusPedido.RASCUNHO).length; }
  get pedidosAprovados(): number { return this.pedidos.filter(p => p.status === StatusPedido.APROVADO).length; }
  get pedidosEmProducao(): number { return this.pedidos.filter(p => p.status === StatusPedido.EM_PRODUCAO).length; }
  get pedidosEntregues(): number { return this.pedidos.filter(p => p.status === StatusPedido.ENTREGUE).length; }
  
  // 📦 FUNÇÃO : Conta a quantidade (ignorando cancelados) de acordo com o status
  contarPedidos(status?: string): number {
    return this.pedidos
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
  return this.pedidos
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

  chipClass(status: string): string {
  const s = status.toLowerCase();
  const isActive = this.statusFiltro?.toLowerCase() === s;
  
  // 🎨 ESTADO ATIVO: Quando o usuário clica no filtro
  if (isActive) {
    switch (s) {
      case 'entregue': 
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
      case 'em_producao': 
        return 'bg-violet-500 text-white border-violet-600 shadow-sm'; // 🚀 Adicionado aqui!
      case 'rascunho': 
        return 'bg-zinc-500 text-white border-zinc-600 shadow-sm';
      case 'aprovado': 
        return 'bg-sky-500 text-white border-sky-600 shadow-sm';
      case 'cancelado': 
        return 'bg-rose-500 text-white border-rose-600 shadow-sm';
      case 'pendente':
        return 'bg-amber-500 text-white border-amber-600 shadow-sm';
      default: 
        return 'bg-zinc-800 text-white border-zinc-900';
    }
  }

    // ⚪ ESTADO INATIVO: Cor padrão quando não está filtrando por ele
    return 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300';
  }

  novo(): void { this.router.navigate(['/pedidos/novo']); }
  ver(p: PedidoResumo): void { this.router.navigate(['/pedidos', p.id]); }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
