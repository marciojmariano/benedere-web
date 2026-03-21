import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';

import { IngredienteService } from '../../core/services/ingrediente.service';
import { Ingrediente } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { IngredienteDetailDrawerComponent } from './ingrediente-detail-drawer.component';

@Component({
  selector: 'app-ingredientes-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule, InputTextModule,
    PageHeaderComponent, StatusBadgeComponent, CurrencyBrlPipe, IngredienteDetailDrawerComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ingredientes-list.component.html',
})
export class IngredientesListComponent implements OnInit {
  private service = inject(IngredienteService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  ingredientes: Ingrediente[] = [];
  loading = false;

  drawerVisible = signal(false);
  ingredienteSelecionado = signal<Ingrediente | null>(null);

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.ingredientes = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar ingredientes' }); this.loading = false; },
    });
  }

  novo(): void { this.router.navigate(['/ingredientes/novo']); }
  editar(i: Ingrediente): void { this.router.navigate(['/ingredientes', i.id]); }

  abrirDetalhe(i: Ingrediente): void {
    this.ingredienteSelecionado.set(i);
    this.drawerVisible.set(true);
  }

  confirmarDesativar(i: Ingrediente): void {
    this.confirmationService.confirm({
      message: `Deseja desativar "${i.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.desativar(i.id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ingrediente desativado' }); this.carregar(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar' }),
      }),
    });
  }
}
