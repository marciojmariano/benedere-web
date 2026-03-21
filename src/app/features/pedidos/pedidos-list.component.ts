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

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule, InputTextModule,
    PageHeaderComponent, StatusBadgeComponent, CurrencyBrlPipe,
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
  get totalPedidos(): number { return this.pedidos.length; }
  get pedidosPendentes(): number { return this.pedidos.filter(p => p.status === StatusPedido.RASCUNHO || p.status === StatusPedido.APROVADO).length; }
  get pedidosEmProducao(): number { return this.pedidos.filter(p => p.status === StatusPedido.EM_PRODUCAO).length; }
  get pedidosEntregues(): number { return this.pedidos.filter(p => p.status === StatusPedido.ENTREGUE).length; }

  novo(): void { this.router.navigate(['/pedidos/novo']); }
  ver(p: PedidoResumo): void { this.router.navigate(['/pedidos', p.id]); }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
