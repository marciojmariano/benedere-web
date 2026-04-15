import { describe, it, expect } from 'vitest';
import Quill from 'quill';
import { PlaceholderBlot } from './placeholder-blot';
import { IngredientesBlot } from './ingredientes-blot';

Quill.register(PlaceholderBlot);
Quill.register(IngredientesBlot);

describe('PlaceholderBlot', () => {
  it('deve criar span com data-placeholder correto', () => {
    const node = PlaceholderBlot.create('cliente_nome') as HTMLElement;
    expect(node.tagName.toLowerCase()).toBe('span');
    expect(node.getAttribute('data-placeholder')).toBe('cliente_nome');
    expect(node.getAttribute('contenteditable')).toBe('false');
    expect(node.textContent).toBe('{cliente_nome}');
  });

  it('deve retornar o valor correto do node', () => {
    const node = PlaceholderBlot.create('empresa_nome') as HTMLElement;
    const value = PlaceholderBlot.value(node);
    expect(value).toBe('empresa_nome');
  });

  it('deve retornar string vazia se data-placeholder ausente', () => {
    const node = document.createElement('span');
    const value = PlaceholderBlot.value(node);
    expect(value).toBe('');
  });
});

describe('IngredientesBlot', () => {
  it('deve criar div com classe ql-ingredientes-placeholder', () => {
    const node = IngredientesBlot.create() as HTMLElement;
    expect(node.tagName.toLowerCase()).toBe('div');
    expect(node.getAttribute('contenteditable')).toBe('false');
    expect(node.innerHTML).toContain('ingredientes-chip');
    expect(node.innerHTML).toContain('pi-list');
  });

  it('deve retornar true como valor', () => {
    expect(IngredientesBlot.value()).toBe(true);
  });
});
