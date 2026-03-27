import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { ProducaoService } from '../../core/services/producao.service';
import { ProducaoPrintService } from '../../core/services/producao-print.service';
import {
  ExplosaoProducaoResponse,
  ExplosaoIngrediente,
  StatusPedido,
  STATUS_PEDIDO_LABELS,
} from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-producao-explosao',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DatePickerModule, MultiSelectModule, TableModule, ButtonModule,
    ToastModule, PanelModule, TagModule,
    PageHeaderComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService],
  templateUrl: './producao-explosao.component.html',
})
export class ProducaoExplosaoComponent implements OnInit {
  private service = inject(ProducaoService);
  private printService = inject(ProducaoPrintService);
  private messageService = inject(MessageService);

  // ── Filtros ───────────────────────────────────────────────────────────────
  dataInicio: Date = this.getSegundaFeira();
  dataFim: Date = this.getDomingoSemana();
  statusSelecionados: StatusPedido[] = [StatusPedido.APROVADO, StatusPedido.EM_PRODUCAO];
  filtroData: 'entrega' | 'criacao' = 'entrega';

  statusOptions = [
    { label: STATUS_PEDIDO_LABELS[StatusPedido.RASCUNHO],    value: StatusPedido.RASCUNHO },
    { label: STATUS_PEDIDO_LABELS[StatusPedido.APROVADO],    value: StatusPedido.APROVADO },
    { label: STATUS_PEDIDO_LABELS[StatusPedido.EM_PRODUCAO], value: StatusPedido.EM_PRODUCAO },
    { label: STATUS_PEDIDO_LABELS[StatusPedido.ENTREGUE],    value: StatusPedido.ENTREGUE },
    { label: STATUS_PEDIDO_LABELS[StatusPedido.CANCELADO],   value: StatusPedido.CANCELADO },
  ];

  // ── Estado ────────────────────────────────────────────────────────────────
  resultado: ExplosaoProducaoResponse | null = null;
  carregando = false;

  ngOnInit(): void {
    this.gerar();
  }

  gerar(): void {
    if (!this.dataInicio || !this.dataFim || !this.statusSelecionados.length) return;

    this.carregando = true;
    this.resultado = null;

    this.service.getExplosao({
      data_inicio: this.formatDateParam(this.dataInicio),
      data_fim: this.formatDateParam(this.dataFim),
      status: this.statusSelecionados,
      filtro_data: this.filtroData,
    }).subscribe({
      next: res => {
        this.resultado = res;
        this.carregando = false;
      },
      error: (err: any) => {
        console.error('Erro ao gerar explosão BOM:', err);
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Não foi possível gerar a ordem de produção.',
        });
      },
    });
  }

  imprimir(): void {
    if (!this.resultado) return;
    const ok = this.printService.imprimir(this.resultado);
    if (!ok) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pop-up bloqueado',
        detail: 'Permita pop-ups nesta página para imprimir.',
      });
    }
  }

  temDeficit(ing: ExplosaoIngrediente): boolean {
    return ing.deficit_g !== null && parseFloat(ing.deficit_g) > 0;
  }

  formatQtdG(g: string): string {
    const val = parseFloat(g);
    if (val >= 1000) return (val / 1000).toFixed(3) + ' kg';
    return val.toFixed(0) + ' g';
  }

  get insumos(): ExplosaoIngrediente[] {
    return this.resultado?.ingredientes.filter(i => i.tipo === 'INSUMO') ?? [];
  }

  get embalagens(): ExplosaoIngrediente[] {
    return this.resultado?.ingredientes.filter(i => i.tipo === 'EMBALAGEM') ?? [];
  }

  private formatDateParam(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getSegundaFeira(): Date {
    const d = new Date();
    const day = d.getDay(); // 0=dom
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getDomingoSemana(): Date {
    const d = this.getSegundaFeira();
    d.setDate(d.getDate() + 6);
    return d;
  }
}
