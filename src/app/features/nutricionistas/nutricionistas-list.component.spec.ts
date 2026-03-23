import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { NutricionistasListComponent } from './nutricionistas-list.component';
import { NutricionistaService } from '../../core/services/nutricionista.service';
import { Nutricionista } from '../../core/models/index';

const makeNutricionista = (partial: Partial<Nutricionista>): Nutricionista => ({
  id: '1',
  nome: 'Maria Silva',
  crn: 'CRN-1234',
  email: 'maria@nutri.com',
  telefone: null,
  ativo: true,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
  ...partial,
});

const nutricionistas: Nutricionista[] = [
  makeNutricionista({ id: '1', nome: 'Maria Silva', crn: 'CRN-1234', email: 'maria@nutri.com' }),
  makeNutricionista({ id: '2', nome: 'João Nutrição', crn: 'CRN-5678', email: 'joao@nutri.com' }),
  makeNutricionista({ id: '3', nome: 'Ana Costa', crn: 'CRN-ABCD', email: null }),
];

describe('NutricionistasListComponent', () => {
  let fixture: ComponentFixture<NutricionistasListComponent>;
  let component: NutricionistasListComponent;

  const listarFn = vi.fn(() => of(nutricionistas));
  const desativarFn = vi.fn(() => of(undefined));
  const navigateFn = vi.fn();

  const mockService = { listar: listarFn, desativar: desativarFn };
  const mockRouter = { navigate: navigateFn };

  beforeEach(async () => {
    listarFn.mockReturnValue(of(nutricionistas));
    navigateFn.mockReset();

    await TestBed.configureTestingModule({
      imports: [NutricionistasListComponent],
      providers: [
        provideNoopAnimations(),
        { provide: NutricionistaService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NutricionistasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call listar() no ngOnInit', () => {
    expect(listarFn).toHaveBeenCalled();
  });

  // ── Busca ──────────────────────────────────────────────────────────────────

  describe('busca reativa', () => {
    it('should retornar todos quando busca está vazia', () => {
      component.busca.set('');
      expect(component.nutricionistas().length).toBe(3);
    });

    it('should filtrar por nome', () => {
      component.busca.set('maria');
      const resultado = component.nutricionistas();
      expect(resultado.length).toBe(1);
      expect(resultado[0].nome).toBe('Maria Silva');
    });

    it('should filtrar por CRN', () => {
      component.busca.set('5678');
      const resultado = component.nutricionistas();
      expect(resultado.length).toBe(1);
      expect(resultado[0].crn).toBe('CRN-5678');
    });

    it('should filtrar por email', () => {
      component.busca.set('joao@nutri');
      const resultado = component.nutricionistas();
      expect(resultado.length).toBe(1);
      expect(resultado[0].nome).toBe('João Nutrição');
    });

    it('should ser case-insensitive', () => {
      component.busca.set('MARIA');
      expect(component.nutricionistas().length).toBe(1);
    });

    it('should retornar vazio quando nada encontrado', () => {
      component.busca.set('xyzxyz');
      expect(component.nutricionistas().length).toBe(0);
    });

    it('should ignorar email null na busca sem lançar erro', () => {
      component.busca.set('ana');
      expect(component.nutricionistas().length).toBe(1);
      expect(component.nutricionistas()[0].nome).toBe('Ana Costa');
    });

    it('should tratar busca com espaços nas bordas', () => {
      component.busca.set('  maria  ');
      expect(component.nutricionistas().length).toBe(1);
    });
  });

  // ── Navegação ──────────────────────────────────────────────────────────────

  describe('navegação', () => {
    it('should navegar para /nutricionistas/novo ao chamar novo()', () => {
      component.novo();
      expect(navigateFn).toHaveBeenCalledWith(['/nutricionistas/novo']);
    });

    it('should navegar para /nutricionistas/:id ao chamar editar()', () => {
      component.editar(nutricionistas[0]);
      expect(navigateFn).toHaveBeenCalledWith(['/nutricionistas', '1']);
    });
  });

  // ── Carregamento ───────────────────────────────────────────────────────────

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
});
