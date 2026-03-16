import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { OrcamentoService } from '../../core/services/orcamento.service';
import { ClienteService } from '../../core/services/cliente.service';
import { Orcamento, Cliente, StatusOrcamento } from '../../core/models';

@Component({
  selector: 'app-orcamentos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './orcamentos-list.component.html',
})
export class OrcamentosListComponent implements OnInit {
  private service = inject(OrcamentoService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  orcamentos: Orcamento[] = [];
  clientes: Map<string, string> = new Map();
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    forkJoin({
      orcamentos: this.service.listar(),
      clientes: this.clienteService.listar(false),
    }).subscribe({
      next: ({ orcamentos, clientes }) => {
        this.orcamentos = orcamentos;
        clientes.forEach((c: Cliente) => this.clientes.set(c.id, c.nome));
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar orçamentos' });
        this.loading = false;
      },
    });
  }

  nomeCliente(id: string): string {
    return this.clientes.get(id) || id;
  }

  novo(): void { this.router.navigate(['/orcamentos/novo']); }
  ver(o: Orcamento): void { this.router.navigate(['/orcamentos', o.id]); }

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
  statusLabel(status: StatusOrcamento): string {
    const map: Record<string, string> = {
      rascunho: 'Rascunho',
      enviado: 'Enviado',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
      cancelado: 'Cancelado',
  };
    return map[status] || status;
  }
  baixarPdf(o: Orcamento, event: Event): void {
    event.stopPropagation();
    this.service.downloadPdf(o.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${o.numero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao baixar PDF' }),
    });
  }
}