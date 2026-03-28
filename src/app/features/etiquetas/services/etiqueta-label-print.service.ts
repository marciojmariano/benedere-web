import { Injectable } from '@angular/core';
import { BulkLabelItem, Tenant } from '../../../core/models';
import { EtiquetaRenderService } from './etiqueta-render.service';

@Injectable({ providedIn: 'root' })
export class EtiquetaLabelPrintService {

  constructor(private renderService: EtiquetaRenderService) {}

  /**
   * Abre uma janela de impressão com uma etiqueta por página,
   * formatada para as dimensões configuradas no tenant (impressora térmica).
   */
  print(items: BulkLabelItem[], tenant: Tenant): void {
    const largura = tenant.etiqueta_largura_mm ?? 100;
    const altura = tenant.etiqueta_altura_mm ?? 60;
    const offsetX = tenant.etiqueta_offset_x_mm ?? 0;
    const offsetY = tenant.etiqueta_offset_y_mm ?? 0;
    const templateHtml = tenant.etiqueta_html_output ?? '';

    const pages = items.map(item => {
      const rendered = this.renderService.render(templateHtml, {
        cliente_nome: item.cliente_nome,
        tipo_refeicao: item.tipo_refeicao ?? '',
        data_fabricacao: item.data_fabricacao,
        data_validade: item.data_validade,
        empresa_nome: item.empresa_nome,
        empresa_cnpj: item.empresa_cnpj,
        pedido_numero: item.pedido_numero,
        ingredientes: item.ingredientes,
      });
      return `<div class="etiqueta-page">${rendered}</div>`;
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Etiquetas — Impressão em Lote</title>
  <style>
    @page {
      size: ${largura}mm ${altura}mm;
      margin: ${offsetY}mm ${offsetX}mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10px; }
    .etiqueta-page {
      width: ${largura}mm;
      height: ${altura}mm;
      overflow: hidden;
      page-break-after: always;
    }
    .etiqueta-page:last-child { page-break-after: auto; }
    table { width: 100%; border-collapse: collapse; }
    .ingredientes-table td { padding: 1px 2px; font-size: 9px; }
  </style>
</head>
<body>
  ${pages.join('\n')}
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', `width=${largura * 4},height=${altura * 4}`);
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }
}
