import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { IngredientesListComponent } from './ingredientes-list.component';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { Ingrediente, UnidadeMedida } from '../../core/models/index';

const makeIngrediente = (partial: Partial<Ingrediente>): Ingrediente => ({
  id: '1',
  nome: 'Frango',
  unidade_medida: UnidadeMedida.KG,
  custo_unitario: '25.00',
  descricao: null,
  markup_id: null,
  ativo: true,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
  ...partial,
});

const ingredientes: Ingrediente[] = [
  makeIngrediente({ id: '1', nome: 'Frango', unidade_medida: UnidadeMedida.KG }),
  makeIngrediente({ id: '2', nome: 'Azeite', unidade_medida: UnidadeMedida.ML }),
  makeIngrediente({ id: '3', nome: 'Arroz', unidade_medida: UnidadeMedida.G }),
  makeIngrediente({ id: '4', nome: 'Leite', unidade_medida: UnidadeMedida.L }),
  makeIngrediente({ id: '5', nome: 'Ovo', unidade_medida: UnidadeMedida.UNIDADE }),
];

describe('IngredientesListComponent', () => {
  let fixture: ComponentFixture<IngredientesListComponent>;
  let component: IngredientesListComponent;

  const listarFn = vi.fn(() => of(ingredientes));
  const desativarFn = vi.fn(() => of(undefined));
  const navigateFn = vi.fn();

  const mockService = { listar: listarFn, desativar: desativarFn };
  const mockRouter = { navigate: navigateFn };

  beforeEach(async () => {
    listarFn.mockReturnValue(of(ingredientes));
    navigateFn.mockReset();

    await TestBed.configureTestingModule({
      imports: [IngredientesListComponent],
      providers: [
        provideNoopAnimations(),
        { provide: IngredienteService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call listar() no ngOnInit', () => {
    expect(listarFn).toHaveBeenCalled();
  });

  // ── Filtro de busca textual ────────────────────────────────────────────────

  describe('busca textual', () => {
    it('should retornar todos sem busca nem filtro', () => {
      expect(component.ingredientes().length).toBe(5);
    });

    it('should filtrar por nome', () => {
      component.busca.set('fran');
      const resultado = component.ingredientes();
      expect(resultado.length).toBe(1);
      expect(resultado[0].nome).toBe('Frango');
    });

    it('should ser case-insensitive', () => {
      component.busca.set('ARROZ');
      expect(component.ingredientes().length).toBe(1);
    });

    it('should retornar vazio quando nome não encontrado', () => {
      component.busca.set('xyzxyz');
      expect(component.ingredientes().length).toBe(0);
    });
  });

  // ── Filtro de unidade de medida ────────────────────────────────────────────

  describe('filtro por unidade', () => {
    it('should filtrar por kg', () => {
      component.unidadeFiltro.set(UnidadeMedida.KG);
      const resultado = component.ingredientes();
      expect(resultado.every(i => i.unidade_medida === UnidadeMedida.KG)).toBe(true);
      expect(resultado.length).toBe(1);
    });

    it('should filtrar por ml', () => {
      component.unidadeFiltro.set(UnidadeMedida.ML);
      expect(component.ingredientes().length).toBe(1);
      expect(component.ingredientes()[0].nome).toBe('Azeite');
    });

    it('should filtrar por g', () => {
      component.unidadeFiltro.set(UnidadeMedida.G);
      expect(component.ingredientes()[0].nome).toBe('Arroz');
    });

    it('should filtrar por l', () => {
      component.unidadeFiltro.set(UnidadeMedida.L);
      expect(component.ingredientes()[0].nome).toBe('Leite');
    });

    it('should filtrar por unidade', () => {
      component.unidadeFiltro.set(UnidadeMedida.UNIDADE);
      expect(component.ingredientes()[0].nome).toBe('Ovo');
    });

    it('should remover filtro ao retornar null', () => {
      component.unidadeFiltro.set(UnidadeMedida.KG);
      component.unidadeFiltro.set(null);
      expect(component.ingredientes().length).toBe(5);
    });
  });

  // ── Combinação de busca + filtro ───────────────────────────────────────────

  describe('busca + filtro combinados', () => {
    it('should aplicar ambos ao mesmo tempo', () => {
      component.busca.set('a');
      component.unidadeFiltro.set(UnidadeMedida.ML);
      const resultado = component.ingredientes();
      expect(resultado.length).toBe(1);
      expect(resultado[0].nome).toBe('Azeite');
    });

    it('should retornar vazio quando busca e filtro não coincidem', () => {
      component.busca.set('frango');
      component.unidadeFiltro.set(UnidadeMedida.ML);
      expect(component.ingredientes().length).toBe(0);
    });
  });

  // ── toggleUnidade ─────────────────────────────────────────────────────────

  describe('toggleUnidade', () => {
    it('should ativar filtro ao chamar com unidade diferente', () => {
      component.toggleUnidade(UnidadeMedida.KG);
      expect(component.unidadeFiltro()).toBe(UnidadeMedida.KG);
    });

    it('should desativar filtro ao chamar com a mesma unidade', () => {
      component.unidadeFiltro.set(UnidadeMedida.KG);
      component.toggleUnidade(UnidadeMedida.KG);
      expect(component.unidadeFiltro()).toBeNull();
    });
  });

  // ── chipClass ─────────────────────────────────────────────────────────────

  describe('chipClass', () => {
    it('should retornar classe inativa quando unidade não selecionada', () => {
      component.unidadeFiltro.set(null);
      expect(component.chipClass(UnidadeMedida.KG)).toContain('bg-white');
    });

    it('should retornar classe ativa quando unidade selecionada', () => {
      component.unidadeFiltro.set(UnidadeMedida.KG);
      expect(component.chipClass(UnidadeMedida.KG)).toContain('bg-emerald-600');
    });

    it('should retornar classe inativa para unidade diferente da selecionada', () => {
      component.unidadeFiltro.set(UnidadeMedida.KG);
      expect(component.chipClass(UnidadeMedida.ML)).toContain('bg-white');
    });
  });

  // ── Drawer ────────────────────────────────────────────────────────────────

  describe('drawer de detalhe', () => {
    it('should setar ingrediente e abrir drawer ao chamar abrirDetalhe()', () => {
      component.abrirDetalhe(ingredientes[0]);
      expect(component.ingredienteSelecionado()).toEqual(ingredientes[0]);
      expect(component.drawerVisible()).toBe(true);
    });
  });

  // ── Navegação ─────────────────────────────────────────────────────────────

  describe('navegação', () => {
    it('should navegar para /ingredientes/novo ao chamar novo()', () => {
      component.novo();
      expect(navigateFn).toHaveBeenCalledWith(['/ingredientes/novo']);
    });

    it('should navegar para /ingredientes/:id ao chamar editar()', () => {
      component.editar(ingredientes[0]);
      expect(navigateFn).toHaveBeenCalledWith(['/ingredientes', '1']);
    });
  });

  // ── Carregamento ──────────────────────────────────────────────────────────

  describe('carregar', () => {
    it('should setar loading=false após sucesso', () => {
      expect(component.loading).toBe(false);
    });

    it('should setar loading=false após erro', () => {
      listarFn.mockReturnValue(throwError(() => new Error('Erro')));
      component.carregar();
      expect(component.loading).toBe(false);
    });
  });

  // ── Unidades disponíveis ──────────────────────────────────────────────────

  it('should expor todas as unidades de medida', () => {
    const unidades = Object.values(UnidadeMedida);
    expect(component.unidades).toEqual(unidades);
  });
});
