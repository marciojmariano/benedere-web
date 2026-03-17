import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { IndiceMarkupService } from '../../core/services/indice-markup.service';
import { IndiceMarkup } from '../../core/models';

@Component({
  selector: 'app-indice-markup-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './indice-markup-list.component.html',
})
export class IndiceMarkupListComponent implements OnInit {
  private service = inject(IndiceMarkupService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  indices: IndiceMarkup[] = [];
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.indices = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar índices' }); this.loading = false; },
    });
  }

  novo(): void { this.router.navigate(['/indices-markup/novo']); }
  editar(i: IndiceMarkup): void { this.router.navigate(['/indices-markup', i.id]); }

  confirmarDesativar(i: IndiceMarkup): void {
    this.confirmationService.confirm({
      message: `Deseja desativar o índice "${i.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.desativar(i.id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Índice desativado' }); this.carregar(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar' }),
      }),
    });
  }
}