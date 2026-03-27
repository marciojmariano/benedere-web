import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { EtiquetaRenderService } from './etiqueta-render.service';
import { EtiquetaData } from '../../../core/models';

const SAMPLE_DATA: EtiquetaData = {
  cliente_nome: 'Ana Costa',
  tipo_refeicao: 'Almoço',
  data_fabricacao: '27/03/2026',
  data_validade: '30/03/2026',
  empresa_nome: 'FitMeals',
  empresa_cnpj: '12.345.678/0001-90',
  ingredientes: [
    { nome: 'Frango', peso_g: 150 },
    { nome: 'Arroz', peso_g: 100 },
  ],
};

describe('EtiquetaRenderService', () => {
  let service: EtiquetaRenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtiquetaRenderService);
  });

  it('deve substituir placeholder simples pelo valor real', () => {
    const html = `<p><span class="ql-placeholder" data-placeholder="cliente_nome">{cliente_nome}</span></p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('Ana Costa');
    expect(result).not.toContain('data-placeholder');
  });

  it('deve substituir múltiplos placeholders', () => {
    const html = `
      <span class="ql-placeholder" data-placeholder="empresa_nome">{empresa_nome}</span>
      <span class="ql-placeholder" data-placeholder="tipo_refeicao">{tipo_refeicao}</span>
    `;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('FitMeals');
    expect(result).toContain('Almoço');
  });

  it('deve manter placeholder intacto se chave não existir nos dados', () => {
    const html = `<span class="ql-placeholder" data-placeholder="chave_inexistente">{chave_inexistente}</span>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('{chave_inexistente}');
  });

  it('deve substituir o bloco de ingredientes pela tabela', () => {
    const html = `
      <div class="ql-ingredientes-placeholder">
        <div class="ingredientes-chip">Tabela de Ingredientes</div>
      </div>
    `;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('<table');
    expect(result).toContain('Frango');
    expect(result).toContain('150g');
    expect(result).toContain('Arroz');
    expect(result).toContain('100g');
  });

  it('deve calcular o peso total correto na tabela', () => {
    const html = `<div class="ql-ingredientes-placeholder"><div class="ingredientes-chip">x</div></div>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('250g'); // 150 + 100
  });

  it('deve retornar peso total zero para lista vazia', () => {
    const html = `<div class="ql-ingredientes-placeholder"><div class="ingredientes-chip">x</div></div>`;
    const dataEmpty: EtiquetaData = { ...SAMPLE_DATA, ingredientes: [] };
    const result = service.render(html, dataEmpty);
    expect(result).toContain('0g');
  });
});
