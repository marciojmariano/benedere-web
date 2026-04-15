import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { ClienteDetailDrawerComponent } from './cliente-detail-drawer.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToastModule,
    ConfirmDialogModule, InputTextModule,
    PageHeaderComponent, StatusBadgeComponent, AvatarComponent, ClienteDetailDrawerComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  clientes: Cliente[] = [];
  loading = false;

  drawerVisible = signal(false);
  clienteSelecionado = signal<Cliente | null>(null);

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.clienteService.listar().subscribe({
      next: (data) => { this.clientes = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes' }); this.loading = false; },
    });
  }

  novo(): void { this.router.navigate(['/clientes/novo']); }
  editar(cliente: Cliente): void { this.router.navigate(['/clientes', cliente.id]); }

  abrirDetalhe(cliente: Cliente): void {
    this.clienteSelecionado.set(cliente);
    this.drawerVisible.set(true);
  }

  confirmarDesativar(cliente: Cliente): void {
    this.confirmationService.confirm({
      message: `Deseja desativar o cliente "${cliente.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.desativar(cliente),
    });
  }

  private desativar(cliente: Cliente): void {
    this.clienteService.desativar(cliente.id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente desativado' }); this.carregar(); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar cliente' }); },
    });
  }
}
