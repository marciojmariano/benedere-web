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
    const largura = tenant.etiqueta_largura_mm ?? 130;
    const altura = tenant.etiqueta_altura_mm ?? 90;
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
        ingredientes_html: item.ingredientes_html,
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
    body { font-family: Arial, sans-serif; font-size: 2.5mm; }
    .etiqueta-page {
      width: ${largura}mm;
      height: ${altura}mm;
      overflow: hidden;
      page-break-after: always;
      display: block; /* Alterado de flex para block para respeitar text-align dos filhos */
      padding: 2mm;
      position: relative;
    }
      
    /* Força que parágrafos e divs ocupem a largura total para o alinhamento funcionar */
    .etiqueta-page p, .etiqueta-page div {
      width: 100%;
      display: block;
    }

    .etiqueta-page:last-child { page-break-after: auto; }
    @media print {
      html, body { width: ${largura}mm; height: ${altura}mm; }
      .etiqueta-page { break-inside: avoid; }
    }
    table { width: 100%; border-collapse: collapse; }
    .ingredientes-table { margin-top: auto; }
    .ingredientes-table td { padding: 0.3mm 1mm; font-size: 2.2mm; line-height: 1.3; }
    .ingredientes-table tfoot td { font-size: 2.2mm; padding-top: 0.5mm; }
    /* Quill formatting classes — necessário pois o spool não carrega quill.snow.css */
    
    /* Correção Crítica BUG009: Forçando o alinhamento com !important */
    .ql-align-center { text-align: center !important; }
    .ql-align-right { text-align: right !important; }
    .ql-align-justify { text-align: justify !important; }
    .ql-size-small { font-size: 0.75em; }
    .ql-size-large { font-size: 1.5em; }
    .ql-size-huge { font-size: 2.5em; }
    .ql-font-serif { font-family: Georgia, "Times New Roman", serif; }
    .ql-font-monospace { font-family: Monaco, "Courier New", monospace; }
    .ql-indent-1 { padding-left: 3em; }
    .ql-indent-2 { padding-left: 6em; }
    .ql-indent-3 { padding-left: 9em; }
    .ql-indent-4 { padding-left: 12em; }
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
