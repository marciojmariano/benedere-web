import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { EstoqueService } from '../../core/services/estoque.service';
import { ImportacaoEstoqueResponse } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-entrada-import',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, ToastModule, FileUploadModule, TableModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './entrada-import.component.html',
})
export class EntradaImportComponent {
  private service = inject(EstoqueService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  arquivoSelecionado = signal<File | null>(null);
  resultado = signal<ImportacaoEstoqueResponse | null>(null);
  importando = signal(false);

  onArquivoSelecionado(event: { files: File[] }): void {
    this.arquivoSelecionado.set(event.files[0] ?? null);
    this.resultado.set(null);
  }

  importar(): void {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um arquivo .xlsx' });
      return;
    }

    this.importando.set(true);
    this.service.importarExcel(arquivo).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.importando.set(false);
        if (res.importadas > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Importação concluída',
            detail: `${res.importadas} de ${res.total_linhas} linhas importadas com sucesso`,
          });
        }
        if (res.erros.length > 0) {
          this.messageService.add({
            severity: res.importadas === 0 ? 'error' : 'warn',
            summary: 'Erros encontrados',
            detail: `${res.erros.length} linha(s) com erro`,
          });
        }
      },
      error: (err) => {
        const detail = err?.error?.detail ?? 'Falha ao processar o arquivo';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
        this.importando.set(false);
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/estoque']);
  }
}
