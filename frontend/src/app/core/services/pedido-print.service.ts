import { Injectable } from '@angular/core';

import {
  Pedido, Cliente, StatusPedido, TipoRefeicao,
  STATUS_PEDIDO_LABELS, TIPO_REFEICAO_LABELS,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PedidoPrintService {

  imprimir(pedido: Pedido, cliente: Cliente): boolean {
    const html = this.buildHtml(pedido, cliente);
    const w = window.open('', '_blank');
    if (!w) return false;

    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
    return true;
  }

  private buildHtml(pedido: Pedido, cliente: Cliente): string {
    const statusLabel = STATUS_PEDIDO_LABELS[pedido.status as StatusPedido] ?? pedido.status;
    const dataEmissao = this.formatDate(pedido.created_at);
    const entregaPrevista = pedido.data_entrega_prevista
      ? this.formatDate(pedido.data_entrega_prevista)
      : null;

    const itensHtml = pedido.itens.map(item => {
      const tipoLabel = item.tipo_refeicao
        ? TIPO_REFEICAO_LABELS[item.tipo_refeicao as TipoRefeicao] ?? ''
        : '';

      const composicaoHtml = item.composicao.length > 0
        ? `<tr><td colspan="5" class="composicao">${item.composicao.map(c => `${c.ingrediente_nome_snap} (${c.quantidade_g}g)`).join(', ')}</td></tr>`
        : '';

      return `
        <tr>
          <td>
            <span class="item-nome">${item.nome_snapshot}</span>
            ${item.tipo === 'PERSONALIZADO' ? '<span class="badge badge-violet">Personalizado</span>' : '<span class="badge badge-sky">Série</span>'}
            ${tipoLabel ? `<span class="badge badge-zinc">${tipoLabel}</span>` : ''}
          </td>
          <td class="center">${item.quantidade}</td>
          <td class="right">${this.formatCurrency(item.preco_unitario)}</td>
          <td class="right bold">${this.formatCurrency(item.preco_total)}</td>
        </tr>
        ${composicaoHtml}
      `;
    }).join('');

    const observacoesHtml = pedido.observacoes
      ? `
        <div class="section">
          <p class="section-title">Observações</p>
          <div class="obs-box">${pedido.observacoes}</div>
        </div>
      `
      : '';

    const entregaHtml = entregaPrevista
      ? `
        <div class="info-item">
          <p class="info-label">Entrega Prevista</p>
          <p class="info-value">${entregaPrevista}</p>
        </div>
      `
      : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Pedido ${pedido.numero} - ${cliente.nome}</title>
  <style>
    @page { margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', Arial, sans-serif; color: #18181b; padding: 32px; line-height: 1.5; }
    @media print { body { padding: 0; } }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #059669; padding-bottom: 16px; }
    .brand { font-size: 22px; font-weight: 900; color: #059669; }
    .brand-sub { font-size: 11px; color: #71717a; margin-top: 2px; }
    .header-right { text-align: right; }
    .doc-numero { font-size: 15px; font-weight: 700; color: #18181b; }
    .doc-data { font-size: 11px; color: #71717a; margin-top: 2px; }
    .status-badge { display: inline-block; margin-top: 6px; padding: 2px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; background: #d1fae5; color: #065f46; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-item {}
    .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 4px; }
    .info-value { font-size: 13px; font-weight: 600; color: #27272a; }

    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 10px; }

    table { width: 100%; border-collapse: collapse; }
    th { background: #f4f4f5; text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 700; }
    td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f4f4f5; vertical-align: top; }
    tr { page-break-inside: avoid; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }

    .item-nome { font-weight: 600; color: #27272a; }
    .badge { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; vertical-align: middle; }
    .badge-sky { background: #e0f2fe; color: #0369a1; }
    .badge-violet { background: #ede9fe; color: #7c3aed; }
    .badge-zinc { background: #f4f4f5; color: #52525b; }

    .composicao { font-size: 11px; color: #71717a; padding-top: 2px !important; padding-bottom: 10px !important; border-bottom: 1px solid #f4f4f5; }

    .total-row td { font-weight: 700; font-size: 14px; color: #059669; border-top: 2px solid #d1fae5; border-bottom: none; }

    .obs-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; font-size: 12px; color: #92400e; }

    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e4e4e7; font-size: 10px; color: #a1a1aa; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Benedere</div>
      <div class="brand-sub">Alimentação Saudável</div>
    </div>
    <div class="header-right">
      <div class="doc-numero">${pedido.numero}</div>
      <div class="doc-data">Emitido em ${dataEmissao}</div>
      <span class="status-badge">${statusLabel}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <p class="info-label">Cliente</p>
      <p class="info-value">${cliente.nome}</p>
    </div>
    <div class="info-item">
      <p class="info-label">Contato</p>
      <p class="info-value">${cliente.telefone || cliente.email || '—'}</p>
    </div>
    ${entregaHtml}
  </div>

  <div class="section">
    <p class="section-title">Itens do Pedido</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="center">Qtd</th>
          <th class="right">Unitário</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itensHtml}
        <tr class="total-row">
          <td colspan="3" class="right">Total Geral</td>
          <td class="right">${this.formatCurrency(pedido.valor_total)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${observacoesHtml}

  <div class="footer">
    Documento gerado automaticamente pelo Benedere &middot; ${new Date().toLocaleString('pt-BR')}
  </div>
</body>
</html>`;
  }

  private formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }
}
