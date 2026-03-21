import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ClienteService } from '../../core/services/cliente.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { ProdutoService } from '../../core/services/produto.service';
import { PedidoService } from '../../core/services/pedido.service';
import { NutricionistaService } from '../../core/services/nutricionista.service';
import { Cliente, Ingrediente, Produto, PedidoResumo, Nutricionista, StatusPedido, STATUS_PEDIDO_LABELS } from '../../core/models';
import { KpiCardComponent } from '../../shared/components/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, StatusBadgeComponent, AvatarComponent, CurrencyBrlPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private ingredienteService = inject(IngredienteService);
  private produtoService = inject(ProdutoService);
  private pedidoService = inject(PedidoService);
  private nutricionistaService = inject(NutricionistaService);
  private router = inject(Router);

  loading = true;

  // KPIs
  totalClientes = 0;
  totalIngredientes = 0;
  totalProdutos = 0;
  totalPedidosPendentes = 0;

  // Lists
  ultimosClientes: Cliente[] = [];
  pedidosRecentes: PedidoResumo[] = [];
  nutricionistas: Nutricionista[] = [];

  statusLabels = STATUS_PEDIDO_LABELS;

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(),
      ingredientes: this.ingredienteService.listar(),
      produtos: this.produtoService.listar(),
      pedidos: this.pedidoService.listar(),
      nutricionistas: this.nutricionistaService.listar(),
    }).subscribe({
      next: (data) => {
        this.totalClientes = data.clientes.length;
        this.totalIngredientes = data.ingredientes.length;
        this.totalProdutos = data.produtos.length;

        this.ultimosClientes = data.clientes.slice(0, 5);
        this.nutricionistas = data.nutricionistas.slice(0, 4);

        // Pedidos pendentes (não entregues nem cancelados)
        const pendentes = data.pedidos.filter(p =>
          p.status !== StatusPedido.ENTREGUE && p.status !== StatusPedido.CANCELADO
        );
        this.totalPedidosPendentes = pendentes.length;
        this.pedidosRecentes = data.pedidos.slice(0, 5);

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
