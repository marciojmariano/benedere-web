import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { NutricionistaService } from '../../core/services/nutricionista.service';
import { Nutricionista } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';

@Component({
  selector: 'app-nutricionistas-list',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, ToastModule, ConfirmDialogModule,
    PageHeaderComponent, StatusBadgeComponent, AvatarComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './nutricionistas-list.component.html',
})
export class NutricionistasListComponent implements OnInit {
  private service = inject(NutricionistaService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  nutricionistas: Nutricionista[] = [];
  loading = false;

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data) => { this.nutricionistas = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar nutricionistas' }); this.loading = false; },
    });
  }

  novo(): void { this.router.navigate(['/nutricionistas/novo']); }
  editar(n: Nutricionista): void { this.router.navigate(['/nutricionistas', n.id]); }

  confirmarDesativar(n: Nutricionista): void {
    this.confirmationService.confirm({
      message: `Deseja desativar "${n.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.service.desativar(n.id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nutricionista desativado(a)' }); this.carregar(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar' }),
      }),
    });
  }
}
