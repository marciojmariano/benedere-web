import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../core/services/pedido.service';
import { PedidoResumo, StatusPedido, STATUS_PEDIDO_LABELS, STATUS_PEDIDO_SEVERITY } from '../../core/models';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <div>
      <p-toast />
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Pedidos</h2>
          <p class="text-gray-500 text-sm mt-1">Gerencie os pedidos</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <p-table [value]="pedidos" [loading]="loading" [paginator]="true" [rows]="10" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Número</th>
              <th>Status</th>
              <th>Valor Total</th>
              <th>Itens</th>
              <th>Data</th>
              <th style="width: 80px">Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-p>
            <tr>
              <td class="font-medium">{{ p.numero }}</td>
              <td><p-tag [value]="getStatusLabel(p.status)" [severity]="getStatusSeverity(p.status)" /></td>
              <td>R$ {{ p.valor_total }}</td>
              <td>{{ p.total_itens }}</td>
              <td>{{ p.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <p-button icon="pi pi-eye" [text]="true" [rounded]="true" size="small" (onClick)="ver(p)" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center text-gray-400 py-8">Nenhum pedido encontrado</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class PedidosListComponent implements OnInit {
  private service = inject(PedidoService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  pedidos: PedidoResumo[] = [];
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data: PedidoResumo[]) => { this.pedidos = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pedidos' }); this.loading = false; },
    });
  }

  ver(p: PedidoResumo): void { this.router.navigate(['/pedidos', p.id]); }

  getStatusLabel(status: StatusPedido): string { return STATUS_PEDIDO_LABELS[status] || status; }
  getStatusSeverity(status: StatusPedido): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
  {
    return (STATUS_PEDIDO_SEVERITY[status] as any) || 'secondary';
  }
}
