import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../core/services/pedido.service';
import { Pedido, StatusPedido, STATUS_PEDIDO_LABELS, STATUS_PEDIDO_SEVERITY } from '../../core/models';

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <div>
      <p-toast />
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Pedido {{ pedido?.numero }}</h2>
          <p class="text-gray-500 text-sm mt-1">Detalhes do pedido</p>
        </div>
        <p-button label="Voltar" icon="pi pi-arrow-left" [outlined]="true" (onClick)="voltar()" />
      </div>

      @if (pedido) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-gray-500 text-sm">Status</span>
              <div class="mt-1"><p-tag [value]="getStatusLabel(pedido.status)" [severity]="getStatusSeverity(pedido.status)" /></div>
            </div>
            <div>
              <span class="text-gray-500 text-sm">Valor Total</span>
              <div class="text-lg font-bold text-gray-800 mt-1">R$ {{ pedido.valor_total }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm">Itens</span>
              <div class="text-lg font-bold text-gray-800 mt-1">{{ pedido.itens?.length || 0 }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm">Data</span>
              <div class="text-gray-800 mt-1">{{ pedido.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
          </div>
        </div>

        <!-- Itens -->
        @for (item of pedido.itens; track item.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
            <div class="flex justify-between items-center mb-2">
              <div>
                <span class="font-semibold text-gray-800">{{ item.nome_snapshot }}</span>
                <span class="text-gray-400 text-sm ml-2">({{ item.tipo }})</span>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">{{ item.quantidade }}x · R$ {{ item.preco_unitario }}</div>
                <div class="font-bold text-gray-800">R$ {{ item.preco_total }}</div>
              </div>
            </div>
            @if (item.composicao?.length) {
              <div class="mt-2 pl-4 border-l-2 border-gray-200">
                @for (c of item.composicao; track c.id) {
                  <div class="text-sm text-gray-600 py-1">
                    {{ c.ingrediente_nome_snap }} · {{ c.quantidade_g }}g
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Ações de status -->
        @if (pedido.status === 'rascunho') {
          <div class="flex gap-3 mt-4">
            <p-button label="Aprovar" icon="pi pi-check" (onClick)="mudarStatus('aprovado')" />
            <p-button label="Cancelar" icon="pi pi-times" severity="danger" [outlined]="true" (onClick)="mudarStatus('cancelado')" />
          </div>
        }
        @if (pedido.status === 'aprovado') {
          <div class="flex gap-3 mt-4">
            <p-button label="Iniciar Produção" icon="pi pi-cog" (onClick)="mudarStatus('em_producao')" />
            <p-button label="Cancelar" icon="pi pi-times" severity="danger" [outlined]="true" (onClick)="mudarStatus('cancelado')" />
          </div>
        }
        @if (pedido.status === 'em_producao') {
          <div class="flex gap-3 mt-4">
            <p-button label="Marcar Entregue" icon="pi pi-truck" (onClick)="mudarStatus('entregue')" />
            <p-button label="Cancelar" icon="pi pi-times" severity="danger" [outlined]="true" (onClick)="mudarStatus('cancelado')" />
          </div>
        }
      }
    </div>
  `,
})
export class PedidoDetailComponent implements OnInit {
  private service = inject(PedidoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  pedido: Pedido | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.voltar(); return; }
    this.loading = true;
    this.service.buscarPorId(id).subscribe({
      next: (data: Pedido) => { this.pedido = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Pedido não encontrado' }); this.voltar(); },
    });
  }

  mudarStatus(status: string): void {
    if (!this.pedido) return;
    this.service.mudarStatus(this.pedido.id, status as StatusPedido).subscribe({
      next: (data: Pedido) => {
        this.pedido = data;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Status atualizado' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar status' }),
    });
  }

  voltar(): void { this.router.navigate(['/pedidos']); }
  getStatusLabel(status: StatusPedido): string { return STATUS_PEDIDO_LABELS[status] || status; }
  getStatusSeverity(status: StatusPedido): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  return (STATUS_PEDIDO_SEVERITY[status] as any) || 'secondary';
}
}
