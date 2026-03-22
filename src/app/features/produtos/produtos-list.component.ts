import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

import { ProdutoService } from '../../core/services/produto.service';
import { Produto, TipoRefeicao, TIPO_REFEICAO_LABELS } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-produtos-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule,
    InputTextModule, PageHeaderComponent, StatusBadgeComponent,
  ],
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
  filtroTipo: TipoRefeicao | null = null;

  tipoRefeicaoLabels = TIPO_REFEICAO_LABELS;
  tiposRefeicao = Object.values(TipoRefeicao);

  tipoEmojis: Record<TipoRefeicao, string> = {
    [TipoRefeicao.CAFE_MANHA]:   '☕',
    [TipoRefeicao.LANCHE_MANHA]: '🥐',
    [TipoRefeicao.ALMOCO]:       '🍽️',
    [TipoRefeicao.LANCHE_TARDE]: '🥪',
    [TipoRefeicao.JANTAR]:       '🌙',
  };

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.produtos = data; this.loading = false; },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos' });
        this.loading = false;
      },
    });
  }

  get produtosFiltrados(): Produto[] {
    if (!this.filtroTipo) return this.produtos;
    return this.produtos.filter(p => p.tipo_refeicao === this.filtroTipo);
  }

  toggleFiltroTipo(tipo: TipoRefeicao): void {
    this.filtroTipo = this.filtroTipo === tipo ? null : tipo;
  }

  get totalAtivos(): number { return this.produtos.filter(p => p.ativo).length; }
  get totalInativos(): number { return this.produtos.filter(p => !p.ativo).length; }
  get semTipo(): number { return this.produtos.filter(p => !p.tipo_refeicao).length; }

  novo(): void { this.router.navigate(['/produtos/novo']); }
  editar(p: Produto): void { this.router.navigate(['/produtos', p.id]); }

  getTipoRefeicaoLabel(tipo: TipoRefeicao | null): string {
    return tipo ? this.tipoRefeicaoLabels[tipo] : '—';
  }

  getTipoEmoji(tipo: TipoRefeicao | null): string {
    return tipo ? this.tipoEmojis[tipo] : '';
  }

  confirmarDesativar(p: Produto): void {
    this.confirmationService.confirm({
      message: `Deseja desativar "${p.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.desativar(p.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto desativado' });
          this.carregar();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar' }),
      }),
    });
  }
}
