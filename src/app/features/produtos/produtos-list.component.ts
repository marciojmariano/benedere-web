import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

import { ProdutoService } from '../../core/services/produto.service';
import { Produto, TipoRefeicao, TIPO_REFEICAO_LABELS } from '../../core/models';

@Component({
  selector: 'app-produtos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, ConfirmDialogModule, InputTextModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './produtos-list.component.html',
})
export class ProdutosListComponent implements OnInit {
  private service = inject(ProdutoService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  produtos: Produto[] = [];
  loading = false;

  tipoRefeicaoLabels = TIPO_REFEICAO_LABELS;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.produtos = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos' }); this.loading = false; },
    });
  }

  novo(): void { this.router.navigate(['/produtos/novo']); }
  editar(p: Produto): void { this.router.navigate(['/produtos', p.id]); }

  getTipoRefeicaoLabel(tipo: TipoRefeicao | null): string {
    return tipo ? this.tipoRefeicaoLabels[tipo] : '—';
  }

  confirmarDesativar(p: Produto): void {
    this.confirmationService.confirm({
      message: `Deseja desativar "${p.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.desativar(p.id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto desativado' }); this.carregar(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar' }),
      }),
    });
  }
}
