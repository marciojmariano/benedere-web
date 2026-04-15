import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { ProdutoService } from '../../core/services/produto.service';
import { PedidoService } from '../../core/services/pedido.service';
import { NutricionistaService } from '../../core/services/nutricionista.service';
import { Cliente, Nutricionista, StatusPedido } from '../../core/models';
import { KpiCardComponent } from '../../shared/components/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, StatusBadgeComponent, AvatarComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private clienteService = inject(ClienteService);
  private ingredienteService = inject(IngredienteService);
  private produtoService = inject(ProdutoService);
  private pedidoService = inject(PedidoService);
  private nutricionistaService = inject(NutricionistaService);
  private router = inject(Router);

  loading = true;
  nomeUsuario = 'Admin';

  // KPIs
  totalClientes = 0;
  totalIngredientes = 0;
  totalProdutos = 0;
  totalPedidosPendentes = 0;

  // Lists
  ultimosClientes: Cliente[] = [];
  nutricionistas: Nutricionista[] = [];

  get saudacao(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user?.given_name) this.nomeUsuario = user.given_name;
      else if (user?.name) this.nomeUsuario = user.name.split(' ')[0];
    });

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
        this.ultimosClientes = data.clientes.slice(0, 6);
        this.nutricionistas = data.nutricionistas.slice(0, 6);

        const pendentes = data.pedidos.filter(p =>
          p.status !== StatusPedido.ENTREGUE && p.status !== StatusPedido.CANCELADO
        );
        this.totalPedidosPendentes = pendentes.length;

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
