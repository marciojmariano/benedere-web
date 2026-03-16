import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { MarkupService } from '../../core/services/markup.service';
import { Markup } from '../../core/models';

@Component({
  selector: 'app-markups-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './markups-list.component.html',
})
export class MarkupsListComponent implements OnInit {
  private service = inject(MarkupService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  markups: Markup[] = [];
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.markups = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar markups' }); this.loading = false; },
    });
  }

  novo(): void { this.router.navigate(['/markups/novo']); }
  editar(m: Markup): void { this.router.navigate(['/markups', m.id]); }

  confirmarDesativar(m: Markup): void {
    this.confirmationService.confirm({
      message: `Deseja desativar "${m.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.desativar(m.id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Markup desativado' }); this.carregar(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar' }),
      }),
    });
  }
}