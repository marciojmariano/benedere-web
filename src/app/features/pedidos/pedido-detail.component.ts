import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../core/services/pedido.service';
import { Pedido, StatusPedido } from '../../core/models';

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ToastModule, TableModule],
  providers: [MessageService],
  templateUrl: './pedido-detail.component.html',
})
export class PedidoDetailComponent implements OnInit {
  private service = inject(PedidoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  pedido: Pedido | null = null;
  loading = false;

  proximosStatus: Record<string, StatusPedido[]> = {
    aguardando_producao: [StatusPedido.EM_PRODUCAO, StatusPedido.CANCELADO],
    em_producao: [StatusPedido.PRONTO, StatusPedido.CANCELADO],
    pronto: [StatusPedido.ENTREGUE],
    entregue: [],
    cancelado: [],
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.service.buscarPorId(id).subscribe({
      next: (data) => { this.pedido = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Pedido não encontrado' }); this.voltar(); },
    });
  }

  mudarStatus(status: StatusPedido): void {
    this.service.mudarStatus(this.pedido!.id, status).subscribe({
      next: (data) => { this.pedido = data; this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Status: ${status}` }); },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.detail || 'Erro ao mudar status' }),
    });
  }

  baixarPdf(): void {
    this.service.downloadPdf(this.pedido!.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.pedido!.numero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao baixar PDF' }),
    });
  }

  statusSeverity(status: StatusPedido): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      aguardando_producao: 'secondary',
      em_producao: 'info',
      pronto: 'success',
      entregue: 'success',
      cancelado: 'danger',
    };
    return map[status] || 'secondary';
  }

  statusLabel(status: StatusPedido): string {
    const map: Record<string, string> = { aguardando_producao: 'Aguardando', em_producao: 'Em Produção', pronto: 'Pronto', entregue: 'Entregue', cancelado: 'Cancelado' };
    return map[status] || status;
  }

  voltar(): void { this.router.navigate(['/pedidos']); }
}