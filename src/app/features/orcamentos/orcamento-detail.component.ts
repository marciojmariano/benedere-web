import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';

import { OrcamentoService } from '../../core/services/orcamento.service';
import { PedidoService } from '../../core/services/pedido.service';
import { Orcamento, StatusOrcamento } from '../../core/models';

@Component({
  selector: 'app-orcamento-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ToastModule, ConfirmDialogModule, TableModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './orcamento-detail.component.html',
})
export class OrcamentoDetailComponent implements OnInit {
  private service = inject(OrcamentoService);
  private pedidoService = inject(PedidoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  StatusOrcamento = StatusOrcamento;
  orcamento: Orcamento | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.service.buscarPorId(id).subscribe({
      next: (data) => { this.orcamento = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Orçamento não encontrado' }); this.voltar(); },
    });
  }

  mudarStatus(status: StatusOrcamento): void {
    this.service.mudarStatus(this.orcamento!.id, status).subscribe({
      next: (data) => { this.orcamento = data; this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Status atualizado para ${status}` }); },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.detail || 'Erro ao mudar status' }),
    });
  }

  gerarPedido(): void {
    this.confirmationService.confirm({
      message: 'Deseja gerar um pedido para este orçamento?',
      header: 'Confirmar',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.pedidoService.criarDePedido({ orcamento_id: this.orcamento!.id }).subscribe({
          next: (pedido) => { this.messageService.add({ severity: 'success', summary: 'Pedido criado!', detail: `Pedido ${pedido.numero} gerado` }); setTimeout(() => this.router.navigate(['/pedidos', pedido.id]), 1500); },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.detail || 'Erro ao gerar pedido' }),
        });
      },
    });
  }

  baixarPdf(): void {
    this.service.downloadPdf(this.orcamento!.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.orcamento!.numero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao baixar PDF' }),
    });
  }

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

  voltar(): void { this.router.navigate(['/orcamentos']); }
}