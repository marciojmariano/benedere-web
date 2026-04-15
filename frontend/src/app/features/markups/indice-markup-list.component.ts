import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';

import { IndiceMarkupService } from '../../core/services/indice-markup.service';
import { IndiceMarkup } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-indice-markup-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule, ConfirmDialogModule, InputTextModule,
    PageHeaderComponent, StatusBadgeComponent,
  ],
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
  busca = '';
  Math = Math;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.indices = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar índices' }); this.loading = false; },
    });
  }

  get indicesFiltrados(): IndiceMarkup[] {
    if (!this.busca.trim()) return this.indices;
    const b = this.busca.toLowerCase();
    return this.indices.filter(i => i.nome.toLowerCase().includes(b) || i.descricao?.toLowerCase().includes(b));
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
