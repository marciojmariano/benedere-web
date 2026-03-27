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
  TIPO_REFEICAO_LABELS, TIPO_REFEICAO_META, Produto, Ingrediente, Cliente,
} from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusTimelineComponent } from '../../shared/components/status-timeline.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

interface ComposicaoTemp {
  ingrediente_id: string | null;
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

  // Builder inline adicionar item
  showItemBuilder = false;
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

  // Cancelamento
  showCancelDialog = false;
  motivoCancelamento = '';

  readonly MAX_INGREDIENTES = 4;
  readonly Math = Math;

  tiposRefeicao = Object.values(TipoRefeicao).map(v => ({ label: TIPO_REFEICAO_LABELS[v], value: v }));
  tiposRefeicaoMeta = TIPO_REFEICAO_META;
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
    const id = this.pedido.id;
    this.service.mudarStatus(id, status).subscribe({
      next: () => {
        this.carregarPedido(id);
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
  get isEditavel(): boolean {
    return this.pedido?.status === StatusPedido.RASCUNHO || this.pedido?.status === StatusPedido.APROVADO;
  }
  get isFinalizado(): boolean {
    return this.pedido?.status === StatusPedido.ENTREGUE || this.pedido?.status === StatusPedido.CANCELADO;
  }

  // ── Dialog adicionar item ───────────────────────────────────────────────

  abrirItemBuilder(): void {
    this.itemTipo = TipoItem.SERIE;
    this.produtoSelecionadoId = null;
    this.serieQuantidade = 1;
    this.serieTipoRefeicao = null;
    this.persNome = '';
    this.persQuantidade = 1;
    this.persTipoRefeicao = null;
    this.persComposicao = [{ ingrediente_id: null, ingrediente_nome: '', quantidade_g: 0, custo_unitario: 0 }];
    this.showItemBuilder = true;
    setTimeout(() => document.getElementById('item-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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
        this.showItemBuilder = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item adicionado' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar item' }),
    });
  }

  // ── Item personalizado ──────────────────────────────────────────────────

  adicionarLinhaIngrediente(): void {
    if (this.persComposicao.length >= this.MAX_INGREDIENTES) return;
    this.persComposicao.push({ ingrediente_id: null, ingrediente_nome: '', quantidade_g: 0, custo_unitario: 0 });
  }

  setIngrediente(index: number, ingredienteId: string | null): void {
    const row = this.persComposicao[index];
    if (!ingredienteId) {
      row.ingrediente_id = null;
      row.ingrediente_nome = '';
      row.custo_unitario = 0;
      return;
    }
    const ing = this.ingredientes.find(i => i.id === ingredienteId);
    if (!ing) return;
    row.ingrediente_id = ing.id;
    row.ingrediente_nome = ing.nome;
    row.custo_unitario = +(ing.custo_calculado ?? ing.custo_unitario);
  }

  removerIngredienteTemp(index: number): void {
    this.persComposicao.splice(index, 1);
    if (this.persComposicao.length === 0) {
      this.persComposicao.push({ ingrediente_id: null, ingrediente_nome: '', quantidade_g: 0, custo_unitario: 0 });
    }
  }

  ingredientesDisponiveisPara(currentId: string | null): Ingrediente[] {
    const usados = new Set(
      this.persComposicao.map(c => c.ingrediente_id).filter(id => id && id !== currentId)
    );
    return this.ingredientes.filter(i => !usados.has(i.id));
  }

  get persComposicaoValida(): boolean {
    return this.persComposicao.some(c => c.ingrediente_id && c.quantidade_g > 0);
  }

  get persCustoTotal(): number {
    return this.persComposicao.reduce((acc, c) => acc + (c.quantidade_g / 1000) * c.custo_unitario, 0);
  }

  get persPesoTotal(): number {
    return this.persComposicao.reduce((acc, c) => acc + c.quantidade_g, 0);
  }

  adicionarItemPersonalizado(): void {
    if (!this.pedido || !this.persNome || !this.persComposicaoValida) return;

    const item: any = {
      tipo: TipoItem.PERSONALIZADO,
      nome: this.persNome,
      quantidade: this.persQuantidade,
      tipo_refeicao: this.persTipoRefeicao,
      composicao: this.persComposicao
        .filter(c => c.ingrediente_id && c.quantidade_g > 0)
        .map(c => ({
          ingrediente_id: c.ingrediente_id,
          quantidade_g: c.quantidade_g,
        })),
    };

    this.service.adicionarItem(this.pedido.id, item).subscribe({
      next: (data) => {
        this.pedido = data;
        this.showItemBuilder = false;
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

  duplicarPedido(): void {
    if (!this.pedido) return;
    this.service.duplicar(this.pedido.id).subscribe({
      next: (novo) => {
        this.messageService.add({ severity: 'success', summary: 'Duplicado', detail: `Pedido ${novo.numero} criado como rascunho` });
        setTimeout(() => this.router.navigate(['/pedidos', novo.id]), 800);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao duplicar pedido' }),
    });
  }

  voltar(): void { this.router.navigate(['/pedidos']); }
  getTipoRefeicaoLabel(tipo: TipoRefeicao | null): string { return tipo ? TIPO_REFEICAO_LABELS[tipo] : '—'; }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
