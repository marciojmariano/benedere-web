import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../core/services/pedido.service';
import { Pedido, StatusOrcamento, StatusPedido } from '../../core/models';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './pedidos-list.component.html',
})
export class PedidosListComponent implements OnInit {
  private service = inject(PedidoService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  pedidos: Pedido[] = [];
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.pedidos = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pedidos' }); this.loading = false; },
    });
  }

  ver(p: Pedido): void { this.router.navigate(['/pedidos', p.id]); }

  statusSeverity(status: StatusOrcamento): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      rascunho: 'secondary',
      enviado: 'info',
      aprovado: 'success',
      reprovado: 'danger',
      cancelado: 'danger',
    };
    return map[status] || 'secondary';
  }

  baixarPdf(p: Pedido, event: Event): void {
    event.stopPropagation();
    this.service.downloadPdf(p.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${p.numero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao baixar PDF' }),
    });
  }
}