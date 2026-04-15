import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../core/services/pedido.service';
import { EtiquetaService } from '../../core/services/etiqueta.service';
import { EtiquetaLabelPrintService } from '../etiquetas/services/etiqueta-label-print.service';
import { EtiquetaRenderService } from '../etiquetas/services/etiqueta-render.service';
import { PedidoResumo, StatusPedido, STATUS_PEDIDO_LABELS, Tenant, BulkLabelItem } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule, InputTextModule,
    CheckboxModule, PageHeaderComponent, StatusBadgeComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService],
  templateUrl: './pedidos-list.component.html',
})
export class PedidosListComponent implements OnInit {
  // Injeção de Dependências
  private service = inject(PedidoService);
  private etiquetaService = inject(EtiquetaService);
  private printService = inject(EtiquetaLabelPrintService);
  private renderService = inject(EtiquetaRenderService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Estado
  pedidos: PedidoResumo[] = [];
  loading = false;
  statusFiltro: StatusPedido | null = null;
  selectedIds = new Set<string>();
  printLoading = false;
  tenant: Tenant | null = null;

  // Labels
  statusOptions = Object.values(StatusPedido);
  statusLabels = STATUS_PEDIDO_LABELS;

  ngOnInit(): void {
    this.carregar();
    this.etiquetaService.obterSettings().subscribe({
      next: t => (this.tenant = t),
    });
  }

  carregar(): void {
    this.loading = true;
    this.selectedIds.clear();
    this.service.listar(this.statusFiltro || undefined).subscribe({
      next: (data) => { 
        this.pedidos = data; 
        this.loading = false; 
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pedidos' });
        this.loading = false;
      },
    });
  }

  imprimirEtiquetas(): void {
    if (!this.tenant) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Configurações de etiqueta não carregadas.' });
      return;
    }
    if (this.selectedIds.size === 0) return;

    this.printLoading = true;
    const ids = Array.from(this.selectedIds);

    this.service.bulkLabelData(ids).subscribe({
      next: (items: BulkLabelItem[]) => {
        // Processamento para BUG009 (Alinhamento) e TS2345 (Null Safety)
        const itemsProcessados = items.map(item => {
          const htmlRenderizado = this.renderService.render(
            this.tenant!.etiqueta_html_output ?? '', 
            {
              ...item,
              tipo_refeicao: item.tipo_refeicao ?? ''
            }
          );
          
          return {
            ...item,
            html: htmlRenderizado 
          };
        });

        this.printService.print(itemsProcessados, this.tenant!);

        const uniqueIds = [...new Set(items.map(i => i.item_id))];
        this.service.marcarImpressas(uniqueIds).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Impressão iniciada',
              detail: `${res.marcados} etiqueta(s) marcadas como impressas.`,
            });
            this.carregar();
          },
        });

        this.printLoading = false;
        this.selectedIds.clear();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar dados para impressão.' });
        this.printLoading = false;
      },
    });
  }

  // --- Getters para o Template (KPIs) ---
  get totalPedidos(): number { return this.pedidos.length; }

  get pedidosPendentes(): number { 
    return this.pedidos.filter(p => p.status === StatusPedido.RASCUNHO || p.status === StatusPedido.APROVADO).length; 
  }

  get pedidosEmProducao(): number { 
    return this.pedidos.filter(p => p.status === StatusPedido.EM_PRODUCAO).length; 
  }

  get pedidosEntregues(): number { 
    return this.pedidos.filter(p => p.status === StatusPedido.ENTREGUE).length; 
  }

  get valorTotal(): number { 
    return this.pedidos.reduce((acc, p) => acc + parseFloat(p.valor_total), 0); 
  }

  get allSelected(): boolean {
    return this.pedidos.length > 0 && this.selectedIds.size === this.pedidos.length;
  }

  get selectedCount(): number { return this.selectedIds.size; }

  // --- Métodos de UI ---
  toggleStatus(status: StatusPedido): void {
    this.statusFiltro = this.statusFiltro === status ? null : status;
    this.carregar();
  }

  toggleSelect(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedIds.size === this.pedidos.length) {
      this.selectedIds.clear();
    } else {
      this.pedidos.forEach(p => this.selectedIds.add(p.id));
    }
  }

  chipClass(status: StatusPedido): string {
    if (this.statusFiltro !== status) return 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300';
    const map: Record<StatusPedido, string> = {
      [StatusPedido.RASCUNHO]:    'bg-zinc-600 text-white border-zinc-600',
      [StatusPedido.APROVADO]:    'bg-amber-500 text-white border-amber-500',
      [StatusPedido.EM_PRODUCAO]: 'bg-violet-500 text-white border-violet-500',
      [StatusPedido.ENTREGUE]:    'bg-emerald-500 text-white border-emerald-500',
      [StatusPedido.CANCELADO]:   'bg-rose-500 text-white border-rose-500',
    };
    return map[status];
  }

  novo(): void { this.router.navigate(['/pedidos/novo']); }
  ver(p: PedidoResumo): void { this.router.navigate(['/pedidos', p.id]); }
  formatDate(date: string): string { return new Date(date).toLocaleDateString('pt-BR'); }
}