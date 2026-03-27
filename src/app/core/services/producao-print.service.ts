import { Injectable } from '@angular/core';

import {
  ExplosaoProducaoResponse,
  ExplosaoIngrediente,
  MapaMontagemResponse,
  TipoIngrediente,
  TIPO_REFEICAO_LABELS,
  TipoRefeicao,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ProducaoPrintService {

  imprimir(data: ExplosaoProducaoResponse): boolean {
    const html = this.buildHtml(data);
    const w = window.open('', '_blank');
    if (!w) return false;

    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
    return true;
  }

  private buildHtml(data: ExplosaoProducaoResponse): string {
    const now = new Date().toLocaleString('pt-BR');
    const inicio = this.formatDate(data.periodo_inicio);
    const fim = this.formatDate(data.periodo_fim);

    const insumos = data.ingredientes.filter(i => i.tipo === TipoIngrediente.INSUMO);
    const embalagens = data.ingredientes.filter(i => i.tipo === TipoIngrediente.EMBALAGEM);

    const buildTabela = (items: ExplosaoIngrediente[]) =>
      items.map(ing => {
        const qtdKg = (parseFloat(ing.quantidade_total_g) / 1000).toFixed(3);
        const temDeficit = ing.deficit_g !== null && parseFloat(ing.deficit_g) > 0;
        const rowClass = temDeficit ? 'style="background:#fff7ed"' : '';
        const deficitStr = ing.deficit_g !== null
          ? `<span style="color:${temDeficit ? '#c2410c' : '#16a34a'};font-weight:700">${temDeficit ? '⚠ ' + (parseFloat(ing.deficit_g) / 1000).toFixed(3) + ' kg' : 'OK'}</span>`
          : '—';
        return `
          <tr ${rowClass}>
            <td>${ing.ingrediente_nome}</td>
            <td class="center">${ing.unidade_medida}</td>
            <td class="right">${(parseFloat(ing.quantidade_total_g)).toFixed(0)} g</td>
            <td class="right">${qtdKg} kg</td>
            <td class="right">${ing.custo_kg_medio ? this.formatCurrency(ing.custo_kg_medio) : '—'}</td>
            <td class="right">${ing.custo_total_estimado ? this.formatCurrency(ing.custo_total_estimado) : '—'}</td>
            <td class="right">${ing.saldo_atual !== null ? ing.saldo_atual + ' kg' : '—'}</td>
            <td class="center">${deficitStr}</td>
          </tr>
        `;
      }).join('');

    const pedidosHtml = data.pedidos.map(p => `
      <tr>
        <td>${p.pedido_numero}</td>
        <td>${p.cliente_nome}</td>
        <td>${p.data_entrega_prevista ? this.formatDate(p.data_entrega_prevista) : '—'}</td>
        <td class="center">${p.total_itens}</td>
      </tr>
    `).join('');

    const tabelaInsumos = insumos.length > 0 ? `
      <div class="section">
        <p class="section-title">Insumos (${insumos.length})</p>
        <table>
          <thead>
            <tr>
              <th>Ingrediente</th><th class="center">Unidade</th>
              <th class="right">Qtd (g)</th><th class="right">Qtd (kg)</th>
              <th class="right">Custo/kg</th><th class="right">Custo Total</th>
              <th class="right">Saldo</th><th class="center">Déficit</th>
            </tr>
          </thead>
          <tbody>${buildTabela(insumos)}</tbody>
        </table>
      </div>
    ` : '';

    const tabelaEmbalagens = embalagens.length > 0 ? `
      <div class="section">
        <p class="section-title">Embalagens (${embalagens.length})</p>
        <table>
          <thead>
            <tr>
              <th>Ingrediente</th><th class="center">Unidade</th>
              <th class="right">Qtd (g)</th><th class="right">Qtd (kg)</th>
              <th class="right">Custo/kg</th><th class="right">Custo Total</th>
              <th class="right">Saldo</th><th class="center">Déficit</th>
            </tr>
          </thead>
          <tbody>${buildTabela(embalagens)}</tbody>
        </table>
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ordem de Produção — ${inicio} a ${fim}</title>
  <style>
    @page { margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #18181b; padding: 24px; line-height: 1.4; }
    @media print { body { padding: 0; } }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 12px; }
    .brand { font-size: 20px; font-weight: 900; color: #059669; }
    .brand-sub { font-size: 11px; color: #71717a; margin-top: 2px; }
    .header-right { text-align: right; }
    .doc-titulo { font-size: 14px; font-weight: 700; color: #18181b; }
    .doc-periodo { font-size: 13px; color: #059669; font-weight: 700; margin-top: 4px; }
    .doc-data { font-size: 10px; color: #71717a; margin-top: 2px; }

    .cards { display: flex; gap: 16px; margin-bottom: 20px; }
    .card { flex: 1; padding: 12px 16px; border: 1px solid #e4e4e7; border-radius: 8px; }
    .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; }
    .card-value { font-size: 18px; font-weight: 800; color: #18181b; margin-top: 4px; }

    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 8px; }

    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f4f4f5; text-align: left; padding: 6px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 700; }
    td { padding: 7px 10px; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
    tr { page-break-inside: avoid; }
    .center { text-align: center; }
    .right { text-align: right; }

    .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e4e4e7; font-size: 10px; color: #a1a1aa; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Benedere</div>
      <div class="brand-sub">Ordem de Produção</div>
    </div>
    <div class="header-right">
      <div class="doc-titulo">Explosão de Insumos (BOM)</div>
      <div class="doc-periodo">${inicio} → ${fim}</div>
      <div class="doc-data">Gerado em ${now}</div>
    </div>
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-label">Pedidos</div>
      <div class="card-value">${data.total_pedidos}</div>
    </div>
    <div class="card">
      <div class="card-label">Ingredientes</div>
      <div class="card-value">${data.total_ingredientes}</div>
    </div>
    <div class="card">
      <div class="card-label">Custo Total Est.</div>
      <div class="card-value">${this.formatCurrency(data.custo_total_estimado)}</div>
    </div>
  </div>

  ${tabelaInsumos}
  ${tabelaEmbalagens}

  <div class="section">
    <p class="section-title">Pedidos Incluídos (${data.total_pedidos})</p>
    <table>
      <thead>
        <tr>
          <th>Número</th><th>Cliente</th><th>Entrega Prevista</th><th class="center">Itens</th>
        </tr>
      </thead>
      <tbody>${pedidosHtml}</tbody>
    </table>
  </div>

  <div class="footer">
    Documento gerado automaticamente pelo Benedere &middot; ${now}
  </div>
</body>
</html>`;
  }

  imprimirMapa(data: MapaMontagemResponse): boolean {
    const html = this.buildHtmlMapa(data);
    const w = window.open('', '_blank');
    if (!w) return false;

    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
    return true;
  }

  private buildHtmlMapa(data: MapaMontagemResponse): string {
    const now = new Date().toLocaleString('pt-BR');
    const inicio = this.formatDate(data.periodo_inicio);
    const fim = this.formatDate(data.periodo_fim);

    const clientesHtml = data.clientes.map(cliente => {
      const obsClienteHtml = cliente.cliente_observacoes
        ? `<div class="obs-box">📌 ${cliente.cliente_observacoes}</div>`
        : '';
      const enderecoHtml = cliente.cliente_endereco
        ? `<div class="endereco">📍 ${cliente.cliente_endereco}</div>`
        : '';

      const pedidosHtml = cliente.pedidos.map(pedido => {
        const obsPedidoHtml = pedido.observacoes
          ? `<div class="obs-pedido">⚠️ ${pedido.observacoes}</div>`
          : '';
        const entregaStr = pedido.data_entrega_prevista ? this.formatDate(pedido.data_entrega_prevista) : '—';

        const itensHtml = pedido.itens.map(item => {
          const tipoLabel = item.tipo_refeicao
            ? TIPO_REFEICAO_LABELS[item.tipo_refeicao as TipoRefeicao] ?? item.tipo_refeicao
            : '';
          const personalizado = item.tipo === 'PERSONALIZADO' ? ' <span class="badge-personalizado">Personalizado</span>' : '';

          const composicaoHtml = item.composicao.map(c =>
            `<tr><td class="chk">☐</td><td class="ing-nome">${c.ingrediente_nome}</td><td class="ing-qtd">${Number(c.quantidade_g).toFixed(0)} g</td></tr>`
          ).join('');

          const embalagemHtml = item.embalagem_nome
            ? `<tr><td class="chk">☐</td><td class="ing-nome" style="color:#0369a1;font-style:italic">📦 ${item.embalagem_nome}</td><td class="ing-qtd">—</td></tr>`
            : '';

          return `
            <div class="item-card">
              <div class="item-header">
                <span class="item-nome">${item.nome_snapshot}${personalizado}</span>
                <span class="item-meta">${tipoLabel ? tipoLabel + ' &bull; ' : ''}${item.quantidade}x</span>
              </div>
              <table class="comp-table">
                <tbody>
                  ${composicaoHtml}
                  ${embalagemHtml}
                </tbody>
              </table>
            </div>
          `;
        }).join('');

        return `
          <div class="pedido-block">
            <div class="pedido-header">
              <span class="pedido-num">${pedido.pedido_numero}</span>
              <span class="pedido-data">Entrega: ${entregaStr}</span>
            </div>
            ${obsPedidoHtml}
            ${itensHtml}
          </div>
        `;
      }).join('');

      return `
        <div class="cliente-section">
          <div class="cliente-header">
            <span class="cliente-nome">${cliente.cliente_nome}</span>
            ${enderecoHtml}
          </div>
          ${obsClienteHtml}
          ${pedidosHtml}
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Mapa de Montagem — ${inicio} a ${fim}</title>
  <style>
    @page { margin: 12mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #18181b; padding: 20px; font-size: 13px; line-height: 1.4; }
    @media print { body { padding: 0; } }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 2px solid #059669; padding-bottom: 10px; }
    .brand { font-size: 18px; font-weight: 900; color: #059669; }
    .brand-sub { font-size: 10px; color: #71717a; margin-top: 2px; }
    .header-right { text-align: right; }
    .doc-titulo { font-size: 13px; font-weight: 700; }
    .doc-periodo { font-size: 12px; color: #059669; font-weight: 700; margin-top: 3px; }
    .doc-data { font-size: 9px; color: #71717a; margin-top: 2px; }

    .cards { display: flex; gap: 12px; margin-bottom: 16px; }
    .card { flex: 1; padding: 8px 12px; border: 1px solid #e4e4e7; border-radius: 6px; }
    .card-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #71717a; }
    .card-value { font-size: 16px; font-weight: 800; color: #18181b; margin-top: 2px; }

    .cliente-section { margin-bottom: 16px; page-break-inside: avoid; }
    @media print { .cliente-section { page-break-before: auto; } .cliente-section:not(:first-child) { page-break-before: always; } }

    .cliente-header { background: #f0fdf4; border-left: 4px solid #059669; padding: 8px 12px; margin-bottom: 6px; border-radius: 0 6px 6px 0; }
    .cliente-nome { font-size: 16px; font-weight: 900; color: #065f46; display: block; }
    .endereco { font-size: 11px; color: #52525b; margin-top: 2px; }
    .obs-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px 10px; font-size: 11px; color: #92400e; margin-bottom: 6px; }

    .pedido-block { margin-left: 12px; margin-bottom: 10px; border-left: 2px solid #e4e4e7; padding-left: 10px; }
    .pedido-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .pedido-num { font-size: 12px; font-weight: 700; color: #059669; font-family: monospace; }
    .pedido-data { font-size: 11px; color: #71717a; }
    .obs-pedido { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #9a3412; margin-bottom: 5px; }

    .item-card { background: white; border: 1px solid #e4e4e7; border-radius: 6px; margin-bottom: 6px; overflow: hidden; }
    .item-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f4f4f5; border-bottom: 1px solid #e4e4e7; }
    .item-nome { font-size: 13px; font-weight: 700; color: #27272a; }
    .item-meta { font-size: 11px; color: #71717a; }
    .badge-personalizado { background: #ede9fe; color: #7c3aed; font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 99px; margin-left: 4px; }

    .comp-table { width: 100%; border-collapse: collapse; }
    .comp-table td { padding: 4px 10px; font-size: 12px; border-bottom: 1px solid #f4f4f5; }
    .comp-table tr:last-child td { border-bottom: none; }
    .chk { width: 24px; text-align: center; font-size: 14px; color: #a1a1aa; }
    .ing-nome { font-weight: 500; }
    .ing-qtd { text-align: right; font-family: monospace; color: #059669; font-weight: 700; width: 70px; }

    .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e4e4e7; font-size: 9px; color: #a1a1aa; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Benedere</div>
      <div class="brand-sub">Mapa de Montagem</div>
    </div>
    <div class="header-right">
      <div class="doc-titulo">Relatório Operacional de Montagem</div>
      <div class="doc-periodo">${inicio} → ${fim}</div>
      <div class="doc-data">Gerado em ${now}</div>
    </div>
  </div>

  <div class="cards">
    <div class="card"><div class="card-label">Clientes</div><div class="card-value">${data.total_clientes}</div></div>
    <div class="card"><div class="card-label">Pedidos</div><div class="card-value">${data.total_pedidos}</div></div>
    <div class="card"><div class="card-label">Unidades</div><div class="card-value">${data.total_itens}</div></div>
  </div>

  ${clientesHtml}

  <div class="footer">
    Documento gerado automaticamente pelo Benedere &middot; ${now}
  </div>
</body>
</html>`;
  }

  private formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
