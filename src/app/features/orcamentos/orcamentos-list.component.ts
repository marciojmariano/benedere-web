import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { OrcamentoService } from '../../core/services/orcamento.service';
import { Orcamento, StatusOrcamento } from '../../core/models';

@Component({
  selector: 'app-orcamentos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './orcamentos-list.component.html',
})
export class OrcamentosListComponent implements OnInit {
  private service = inject(OrcamentoService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  orcamentos: Orcamento[] = [];
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.orcamentos = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar orçamentos' }); this.loading = false; },
    });
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