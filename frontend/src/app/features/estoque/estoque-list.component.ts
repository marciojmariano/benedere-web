import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { EstoqueService } from '../../core/services/estoque.service';
import { MovimentacaoEstoque, TIPO_MOVIMENTACAO_LABELS, TipoMovimentacao } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule, InputTextModule,
    PageHeaderComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService],
  templateUrl: './estoque-list.component.html',
})
export class EstoqueListComponent implements OnInit {
  private service = inject(EstoqueService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  todasMovimentacoes = signal<MovimentacaoEstoque[]>([]);
  busca = signal('');
  loading = false;

  movimentacoes = computed(() => {
    const termo = this.busca().toLowerCase().trim();
    if (!termo) return this.todasMovimentacoes();
    return this.todasMovimentacoes().filter(m =>
      m.ingrediente_nome.toLowerCase().includes(termo)
    );
  });

  tipoLabel(tipo: TipoMovimentacao): string {
    return TIPO_MOVIMENTACAO_LABELS[tipo] ?? tipo;
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.service.listarMovimentacoes().subscribe({
      next: (movs) => {
        this.todasMovimentacoes.set(movs);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar movimentações' });
        this.loading = false;
      },
    });
  }

  novaEntrada(): void {
    this.router.navigate(['/estoque/nova-entrada']);
  }

  importarExcel(): void {
    this.router.navigate(['/estoque/importar']);
  }
}
