import { Injectable } from '@angular/core';
import { EtiquetaData, IngredienteEtiqueta } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class EtiquetaRenderService {

render(html: string, data: EtiquetaData): string {
    // 1. PRIMEIRO: Injetamos os estilos de alinhamento enquanto as classes ql-align ainda existem
    let result = this.inlineAlignmentStyles(html);

    // 2. DEPOIS: Substituímos os placeholders
    result = this.replacePlaceholderSpans(result, data);

    const tableHtml = (data['ingredientes_html'] && data['ingredientes_html'].length > 0)
      ? data['ingredientes_html']
      : this.buildIngredientesTable(data.ingredientes);

    result = this.replaceIngredientesBlock(result, tableHtml);

    return result;
  }

  private inlineAlignmentStyles(html: string): string {
    // Regex aprimorado para capturar classes de alinhamento e injetar o style correspondente
    return html.replace(
      /<([a-z1-6]+)\b([^>]*?\bql-align-(center|right|justify)\b[^>]*)>/gi,
      (match, tag, attrs, alignment) => {
        const styleValue = alignment === 'justify' ? 'justify' : alignment;
        const styleDecl = `text-align: ${styleValue};`;

        if (/style\s*=\s*"/i.test(attrs)) {
          // Se já tem style, concatena (cuidado para não duplicar text-align)
          return `<${tag} ${attrs.replace(/style\s*=\s*"/i, `style="${styleDecl} `)}">`;
        }
        // Se não tem, cria um novo
        return `<${tag} ${attrs} style="${styleDecl}">`;
      }
    );
  }

  private replacePlaceholderSpans(html: string, data: EtiquetaData): string {
    const ATTR = 'data-placeholder="';
    const openTag = '<span';
    const closeTag = '</span>';
    let result = '';
    let lastIndex = 0;
    let searchFrom = 0;

    while (searchFrom < html.length) {
      const attrPos = html.indexOf(ATTR, searchFrom);
      if (attrPos === -1) break;

      const keyStart = attrPos + ATTR.length;
      const keyEnd = html.indexOf('"', keyStart);
      if (keyEnd === -1) break;
      const key = html.substring(keyStart, keyEnd);

      const spanStart = html.lastIndexOf(openTag, attrPos);
      if (spanStart === -1 || spanStart < lastIndex) { searchFrom = keyEnd; continue; }

      const openEnd = html.indexOf('>', attrPos);
      if (openEnd === -1) break;

      // Conta profundidade de spans para achar o </span> correto
      let depth = 1;
      let pos = openEnd + 1;
      while (depth > 0 && pos < html.length) {
        const nextOpen = html.indexOf(openTag, pos);
        const nextClose = html.indexOf(closeTag, pos);
        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          pos = nextOpen + openTag.length;
        } else {
          depth--;
          if (depth === 0) {
            const spanEnd = nextClose + closeTag.length;
            const value = data[key];
            const replacement = value !== undefined && value !== null ? String(value) : '';
            result += html.substring(lastIndex, spanStart) + replacement;
            lastIndex = spanEnd;
            searchFrom = spanEnd;
          } else {
            pos = nextClose + closeTag.length;
          }
        }
      }
      if (depth > 0) break;
    }

    return result + html.substring(lastIndex);
  }

  private replaceIngredientesBlock(html: string, replacement: string): string {
    const MARKER = 'ql-ingredientes-placeholder';
    const openTag = '<div';
    const closeTag = '</div>';
    let result = '';
    let lastIndex = 0;
    let searchFrom = 0;

    while (searchFrom < html.length) {
      const markerPos = html.indexOf(MARKER, searchFrom);
      if (markerPos === -1) break;

      const blockStart = html.lastIndexOf(openTag, markerPos);
      if (blockStart === -1 || blockStart < lastIndex) { searchFrom = markerPos + MARKER.length; continue; }

      const openEnd = html.indexOf('>', markerPos);
      if (openEnd === -1) break;

      // Conta profundidade de divs para achar o </div> correto
      let depth = 1;
      let pos = openEnd + 1;
      while (depth > 0 && pos < html.length) {
        const nextOpen = html.indexOf(openTag, pos);
        const nextClose = html.indexOf(closeTag, pos);
        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          pos = nextOpen + openTag.length;
        } else {
          depth--;
          if (depth === 0) {
            const blockEnd = nextClose + closeTag.length;
            result += html.substring(lastIndex, blockStart) + replacement;
            lastIndex = blockEnd;
            searchFrom = blockEnd;
          } else {
            pos = nextClose + closeTag.length;
          }
        }
      }
      if (depth > 0) break;
    }

    return result + html.substring(lastIndex);
  }

  buildIngredientesTable(ingredientes: IngredienteEtiqueta[]): string {
    const rows = ingredientes
      .map(i => `<tr><td>${i.nome}</td><td style="text-align:right">${i.peso_g}g</td></tr>`)
      .join('');
    const total = ingredientes.reduce((s, i) => s + i.peso_g, 0);
    return (
      '<table class="ingredientes-table" style="width:100%;border-collapse:collapse;font-size:2.2mm">'
      + `<tbody>${rows}</tbody>`
      + '<tfoot><tr>'
      + '<td style="border-top:1px solid #18181b"><strong>Total</strong></td>'
      + `<td style="text-align:right;border-top:1px solid #18181b"><strong>${total}g</strong></td>`
      + '</tr></tfoot>'
      + '</table>'
    );
  }
}
