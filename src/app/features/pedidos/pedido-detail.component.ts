import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';

import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService } from '../../core/services/produto.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { ClienteService } from '../../core/services/cliente.service';
import { PedidoPrintService } from '../../core/services/pedido-print.service';
import {
  Pedido, PedidoItem, StatusPedido, TipoItem, TipoRefeicao,
  TIPO_REFEICAO_LABELS, Produto, Ingrediente, Cliente,
} from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusTimelineComponent } from '../../shared/components/status-timeline.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

interface ComposicaoTemp {
  ingrediente_id: string;
  ingrediente_nome: string;
  quantidade_g: number;
  custo_unitario: number;
}

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule,
    DialogModule, SelectModule, InputTextModule, InputNumberModule,
    ConfirmDialogModule, TextareaModule,
    PageHeaderComponent, StatusTimelineComponent, StatusBadgeComponent, AvatarComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pedido-detail.component.html',
})
export class PedidoDetailComponent implements OnInit {
  private service = inject(PedidoService);
  private produtoService = inject(ProdutoService);
  private ingredienteService = inject(IngredienteService);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private printService = inject(PedidoPrintService);

  pedido: Pedido | null = null;
  cliente: Cliente | null = null;
  loading = false;

  // Dialog adicionar item
  showItemDialog = false;
  itemTipo: TipoItem = TipoItem.SERIE;
  produtos: Produto[] = [];
  ingredientes: Ingrediente[] = [];

  // Item série
  produtoSelecionadoId: string | null = null;
  serieQuantidade = 1;
  serieTipoRefeicao: TipoRefeicao | null = null;

  // Item personalizado
  persNome = '';
  persQuantidade = 1;
  persTipoRefeicao: TipoRefeicao | null = null;
  persComposicao: ComposicaoTemp[] = [];
  novoIngredienteId: string | null = null;
  novoIngredienteQtd = 0;

  // Cancelamento
  showCancelDialog = false;
  motivoCancelamento = '';

  tiposRefeicao = Object.values(TipoRefeicao).map(v => ({ label: TIPO_REFEICAO_LABELS[v], value: v }));
  tiposItem = [
    { label: 'Produto de Série', value: TipoItem.SERIE },
    { label: 'Personalizado', value: TipoItem.PERSONALIZADO },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.voltar(); return; }
    this.carregarPedido(id);
    this.produtoService.listar().subscribe({ next: (d) => this.produtos = d });
    this.ingredienteService.listar().subscribe({ next: (d) => this.ingredientes = d });
  }

  carregarPedido(id: string): void {
    this.loading = true;
    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.pedido = data;
        this.loading = false;
        this.clienteService.buscarPorId(data.cliente_id).subscribe({
          next: (c) => this.cliente = c,
        });
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Pedido não encontrado' }); this.voltar(); },
    });
  }

  // ── Status ──────────────────────────────────────────────────────────────

  mudarStatus(status: StatusPedido): void {
    if (!this.pedido) return;
    this.service.mudarStatus(this.pedido.id, status).subscribe({
      next: (data) => {
        this.pedido = data;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Status atualizado' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar status' }),
    });
  }

  abrirCancelDialog(): void {
    this.motivoCancelamento = '';
    this.showCancelDialog = true;
  }

  confirmarCancelamento(): void {
    this.showCancelDialog = false;
    this.mudarStatus(StatusPedido.CANCELADO);
  }

  get isRascunho(): boolean { return this.pedido?.status === StatusPedido.RASCUNHO; }
  get isFinalizado(): boolean {
    return this.pedido?.status === StatusPedido.ENTREGUE || this.pedido?.status === StatusPedido.CANCELADO;
  }

  // ── Dialog adicionar item ───────────────────────────────────────────────

  abrirDialogItem(): void {
    this.itemTipo = TipoItem.SERIE;
    this.produtoSelecionadoId = null;
    this.serieQuantidade = 1;
    this.serieTipoRefeicao = null;
    this.persNome = '';
    this.persQuantidade = 1;
    this.persTipoRefeicao = null;
    this.persComposicao = [];
    this.showItemDialog = true;
  }

  // ── Item série ──────────────────────────────────────────────────────────

  adicionarItemSerie(): void {
    if (!this.pedido || !this.produtoSelecionadoId) return;
    const item: any = {
      tipo: TipoItem.SERIE,
      produto_id: this.produtoSelecionadoId,
      quantidade: this.serieQuantidade,
    };
    if (this.serieTipoRefeicao) item.tipo_refeicao = this.serieTipoRefeicao;

    this.service.adicionarItem(this.pedido.id, item).subscribe({
      next: (data) => {
        this.pedido = data;
        this.showItemDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item adicionado' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar item' }),
    });
  }

  // ── Item personalizado ──────────────────────────────────────────────────

  adicionarIngredienteTemp(): void {
    if (!this.novoIngredienteId || this.novoIngredienteQtd <= 0) return;
    const ing = this.ingredientes.find(i => i.id === this.novoIngredienteId);
    if (!ing) return;
    // Prevent duplicates
    if (this.persComposicao.some(c => c.ingrediente_id === ing.id)) return;

    this.persComposicao.push({
      ingrediente_id: ing.id,
      ingrediente_nome: ing.nome,
      quantidade_g: this.novoIngredienteQtd,
      custo_unitario: +ing.custo_unitario,
    });
    this.novoIngredienteId = null;
    this.novoIngredienteQtd = 0;
  }

  removerIngredienteTemp(index: number): void {
    this.persComposicao.splice(index, 1);
  }

  get ingredientesDisponiveis(): Ingrediente[] {
    const usados = new Set(this.persComposicao.map(c => c.ingrediente_id));
    return this.ingredientes.filter(i => !usados.has(i.id));
  }

  get persCustoTotal(): number {
    return this.persComposicao.reduce((acc, c) => acc + (c.quantidade_g / 1000) * c.custo_unitario, 0);
  }

  get persPesoTotal(): number {
    return this.persComposicao.reduce((acc, c) => acc + c.quantidade_g, 0);
  }

  adicionarItemPersonalizado(): void {
    if (!this.pedido || !this.persNome || this.persComposicao.length === 0) return;

    const item: any = {
      tipo: TipoItem.PERSONALIZADO,
      nome: this.persNome,
      quantidade: this.persQuantidade,
      tipo_refeicao: this.persTipoRefeicao,
      composicao: this.persComposicao.map(c => ({
        ingrediente_id: c.ingrediente_id,
        quantidade_g: c.quantidade_g,
      })),
    };

    this.service.adicionarItem(this.pedido.id, item).subscribe({
      next: (data) => {
        this.pedido = data;
        this.showItemDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item personalizado adicionado' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar item' }),
    });
  }

  adicionarItem(): void {
    if (this.itemTipo === TipoItem.SERIE) {
      this.adicionarItemSerie();
    } else {
      this.adicionarItemPersonalizado();
    }
  }

  // ── Remover item ────────────────────────────────────────────────────────

  confirmarRemoverItem(item: PedidoItem): void {
    this.confirmationService.confirm({
      message: `Remover "${item.nome_snapshot}" do pedido?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!this.pedido) return;
        this.service.removerItem(this.pedido.id, item.id).subscribe({
          next: (data) => {
            this.pedido = data;
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item removido' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover item' }),
        });
      },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  imprimirPedido(): void {
    if (!this.pedido || !this.cliente) return;
    const ok = this.printService.imprimir(this.pedido, this.cliente);
    if (!ok) {
      this.messageService.add({
        severity: 'warn', summary: 'Atenção',
        detail: 'Permita pop-ups para imprimir o pedido',
      });
    }
  }

  voltar(): void { this.router.navigate(['/pedidos']); }
  getTipoRefeicaoLabel(tipo: TipoRefeicao | null): string { return tipo ? TIPO_REFEICAO_LABELS[tipo] : '—'; }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
