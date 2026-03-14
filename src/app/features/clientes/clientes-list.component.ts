import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private httpRaw = inject(HttpClient);

  clientes: Cliente[] = [];
  loading = false;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    console.log('Fui chamado! Tentando buscar clientes no serviço...'); // <-- LOG
    this.clienteService.listar().subscribe({
      next: (data) => {
        console.log('Dados recebidos com sucesso:', data); // <-- LOG
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Ocorreu um erro na requisição:', err); // <-- LOG
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes' });
        this.loading = false;
      },
    });
  }

  novo(): void {
    this.router.navigate(['/clientes/novo']);
  }

  editar(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.id]);
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
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente desativado' });
        this.carregar();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar cliente' });
      },
    });
  }
}