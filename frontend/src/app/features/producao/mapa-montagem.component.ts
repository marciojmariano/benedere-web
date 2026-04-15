import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';

import { ProducaoService } from '../../core/services/producao.service';
import { ProducaoPrintService } from '../../core/services/producao-print.service';
import {
  MapaMontagemResponse,
  MapaClienteGrupo,
  StatusPedido,
  STATUS_PEDIDO_LABELS,
  TIPO_REFEICAO_LABELS,
  TipoRefeicao,
} from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-mapa-montagem',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DatePickerModule, MultiSelectModule, ButtonModule,
    ToastModule, PanelModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './mapa-montagem.component.html',
})
export class MapaMontagemComponent implements OnInit {
  private service = inject(ProducaoService);
  private printService = inject(ProducaoPrintService);
  private messageService = inject(MessageService);

  // ── Filtros ───────────────────────────────────────────────────────────────
  dataInicio: Date = this.getHoje();
  dataFim: Date = this.getHoje();
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
  resultado: MapaMontagemResponse | null = null;
  carregando = false;

  readonly tipoRefeicaoLabels = TIPO_REFEICAO_LABELS;

  ngOnInit(): void {
    this.gerar();
  }

  gerar(): void {
    if (!this.dataInicio || !this.dataFim || !this.statusSelecionados.length) return;

    this.carregando = true;
    this.resultado = null;

    this.service.getMapaMontagem({
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
        console.error('Erro ao gerar mapa de montagem:', err);
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Não foi possível gerar o mapa de montagem.',
        });
      },
    });
  }

  imprimir(): void {
    if (!this.resultado) return;
    const ok = this.printService.imprimirMapa(this.resultado);
    if (!ok) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pop-up bloqueado',
        detail: 'Permita pop-ups nesta página para imprimir.',
      });
    }
  }

  tipoRefeicaoLabel(tr: string | null): string {
    if (!tr) return '';
    return TIPO_REFEICAO_LABELS[tr as TipoRefeicao] ?? tr;
  }

  formatQtdG(g: string): string {
    const val = Number(g);
    return val.toFixed(0) + ' g';
  }

  trackByClienteId(_i: number, c: MapaClienteGrupo): string { return c.cliente_id; }

  private formatDateParam(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getHoje(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
