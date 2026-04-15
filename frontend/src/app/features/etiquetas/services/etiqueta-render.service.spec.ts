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

  it('deve retornar string vazia se chave não existir nos dados', () => {
    const html = `<span class="ql-placeholder" data-placeholder="chave_inexistente">{chave_inexistente}</span>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).not.toContain('{chave_inexistente}');
    expect(result).not.toContain('null');
    expect(result).not.toContain('undefined');
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

  it('deve substituir placeholder com guard spans do Quill 2.x', () => {
    const html = `<p><span class="ql-placeholder" data-placeholder="cliente_nome" contenteditable="false"><span contenteditable="false">&#65279;</span>{cliente_nome}<span contenteditable="false">&#65279;</span></span></p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('Ana Costa');
    expect(result).not.toContain('data-placeholder');
    expect(result).not.toContain('{cliente_nome}');
  });

  it('deve substituir múltiplos placeholders com guard spans', () => {
    const html = `
      <span class="ql-placeholder" data-placeholder="empresa_nome" contenteditable="false"><span contenteditable="false">&#65279;</span>{empresa_nome}<span contenteditable="false">&#65279;</span></span>
      <span class="ql-placeholder" data-placeholder="tipo_refeicao" contenteditable="false"><span contenteditable="false">&#65279;</span>{tipo_refeicao}<span contenteditable="false">&#65279;</span></span>
    `;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('FitMeals');
    expect(result).toContain('Almoço');
    expect(result).not.toContain('{empresa_nome}');
    expect(result).not.toContain('{tipo_refeicao}');
  });

  it('deve retornar string vazia para chave inexistente com guard spans', () => {
    const html = `<span class="ql-placeholder" data-placeholder="chave_inexistente" contenteditable="false"><span contenteditable="false">&#65279;</span>{chave_inexistente}<span contenteditable="false">&#65279;</span></span>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).not.toContain('{chave_inexistente}');
    expect(result).not.toContain('null');
    expect(result).not.toContain('undefined');
  });

  it('deve substituir placeholder com guard spans e bloco de ingredientes no mesmo template', () => {
    const html = `
      <span class="ql-placeholder" data-placeholder="cliente_nome" contenteditable="false"><span contenteditable="false">&#65279;</span>{cliente_nome}<span contenteditable="false">&#65279;</span></span>
      <div class="ql-ingredientes-placeholder"><div class="ingredientes-chip">Ingredientes</div></div>
    `;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('Ana Costa');
    expect(result).toContain('<table');
    expect(result).toContain('Frango');
  });

  // BUG-004: ingredientes_html vindo do backend
  it('deve usar ingredientes_html do backend quando disponível', () => {
    const html = `<div class="ql-ingredientes-placeholder"><div class="ingredientes-chip">x</div></div>`;
    const data: EtiquetaData = { ...SAMPLE_DATA, ingredientes_html: '<table class="prebuilt">backend</table>' };
    const result = service.render(html, data);
    expect(result).toContain('backend');
    expect(result).toContain('prebuilt');
    expect(result).not.toContain('ingredientes-chip');
  });

  it('deve usar fallback buildIngredientesTable quando ingredientes_html ausente', () => {
    const html = `<div class="ql-ingredientes-placeholder"><div class="ingredientes-chip">x</div></div>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('Frango');
    expect(result).toContain('150g');
    expect(result).toContain('250g');
  });

  it('deve usar fallback buildIngredientesTable quando ingredientes_html vazio', () => {
    const html = `<div class="ql-ingredientes-placeholder"><div class="ingredientes-chip">x</div></div>`;
    const data: EtiquetaData = { ...SAMPLE_DATA, ingredientes_html: '' };
    const result = service.render(html, data);
    expect(result).toContain('Frango');
    expect(result).toContain('150g');
  });

  it('deve substituir bloco de ingredientes com guard spans do Quill 2.x', () => {
    const html = `<div class="ql-ingredientes-placeholder" contenteditable="false"><span contenteditable="false">&#65279;</span><div class="ingredientes-chip">Tabela de Ingredientes</div><span contenteditable="false">&#65279;</span></div>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('<table');
    expect(result).toContain('Frango');
    expect(result).not.toContain('ingredientes-chip');
  });

  // BUG-009: inline styles para garantir alinhamento independente de CSS externo
  it('deve adicionar style="text-align:right" a elementos com ql-align-right', () => {
    const html = `<p class="ql-align-right"><span class="ql-placeholder" data-placeholder="cliente_nome">{cliente_nome}</span></p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('style="text-align:right"');
    expect(result).toContain('Ana Costa');
  });

  it('deve adicionar style="text-align:center" a elementos com ql-align-center', () => {
    const html = `<p class="ql-align-center">Texto fixo</p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('style="text-align:center"');
  });

  it('deve mesclar text-align em style existente no mesmo elemento', () => {
    const html = `<p class="ql-align-right" style="font-weight:bold">Texto</p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('style="font-weight:bold;text-align:right"');
  });

  it('deve preservar inline style text-align de templates gerados por AlignStyle', () => {
    const html = `<p style="text-align: right;">Rochelli</p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('text-align: right');
  });

  // BUG-008: classes Quill de formatação devem ser preservadas
  it('deve preservar classe ql-align-center no HTML de saída', () => {
    const html = `<p class="ql-align-center"><span class="ql-placeholder" data-placeholder="empresa_nome">{empresa_nome}</span></p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('ql-align-center');
    expect(result).toContain('FitMeals');
  });

  it('deve preservar classe ql-align-right com guard spans', () => {
    const html = `<p class="ql-align-right"><span class="ql-placeholder" data-placeholder="cliente_nome" contenteditable="false"><span contenteditable="false">&#65279;</span>{cliente_nome}<span contenteditable="false">&#65279;</span></span></p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('ql-align-right');
    expect(result).toContain('Ana Costa');
  });

  it('deve preservar múltiplas classes Quill de formatação', () => {
    const html = `<p class="ql-align-right ql-size-large"><span class="ql-placeholder" data-placeholder="tipo_refeicao">{tipo_refeicao}</span></p>`;
    const result = service.render(html, SAMPLE_DATA);
    expect(result).toContain('ql-align-right');
    expect(result).toContain('ql-size-large');
    expect(result).toContain('Almoço');
  });
});
