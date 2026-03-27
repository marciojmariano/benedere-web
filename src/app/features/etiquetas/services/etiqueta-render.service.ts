import { Injectable } from '@angular/core';
import { EtiquetaData, IngredienteEtiqueta } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class EtiquetaRenderService {

  render(html: string, data: EtiquetaData): string {
    let result = html;

    // Substitui spans de placeholder por valores reais
    result = result.replace(
      /<span[^>]*data-placeholder="([^"]+)"[^>]*>[^<]*<\/span>/g,
      (_, key: string) => {
        const value = data[key];
        return value !== undefined && value !== null ? String(value) : `{${key}}`;
      }
    );

    // Substitui o bloco de ingredientes pela tabela real
    // O lazy match precisa pegar os dois níveis de </div> (chip interno + container externo)
    result = result.replace(
      /<div[^>]*class="ql-ingredientes-placeholder"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g,
      this.buildIngredientesTable(data.ingredientes)
    );

    return result;
  }

  private buildIngredientesTable(ingredientes: IngredienteEtiqueta[]): string {
    const rows = ingredientes
      .map(i => `<tr><td>${i.nome}</td><td style="text-align:right">${i.peso_g}g</td></tr>`)
      .join('');
    const total = ingredientes.reduce((s, i) => s + i.peso_g, 0);
    return `
      <table class="ingredientes-table" style="width:100%;border-collapse:collapse;font-size:9px">
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td style="border-top:1px solid #18181b"><strong>Total</strong></td>
            <td style="text-align:right;border-top:1px solid #18181b"><strong>${total}g</strong></td>
          </tr>
        </tfoot>
      </table>
    `;
  }
}
