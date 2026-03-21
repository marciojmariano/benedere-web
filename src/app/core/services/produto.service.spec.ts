import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ProdutoService, ProdutoComposicaoCreate } from './produto.service';
import { environment } from '../../../environments/environment';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProdutoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProdutoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should GET /produtos/ with apenas_ativos=true by default', () => {
      service.listar().subscribe();
      const req = httpMock.expectOne(r => r.url === `${baseUrl}/produtos/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('apenas_ativos')).toBe('true');
      req.flush([]);
    });

    it('should pass apenas_ativos=false when specified', () => {
      service.listar(false).subscribe();
      const req = httpMock.expectOne(r => r.url === `${baseUrl}/produtos/`);
      expect(req.request.params.get('apenas_ativos')).toBe('false');
      req.flush([]);
    });
  });

  describe('buscarPorId', () => {
    it('should GET /produtos/:id', () => {
      const id = 'abc-123';
      service.buscarPorId(id).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({ id, nome: 'Produto Teste' });
    });
  });

  describe('criar', () => {
    it('should POST /produtos/', () => {
      const dados = { nome: 'Novo Produto', tipo_refeicao: 'almoco' };
      service.criar(dados).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dados);
      req.flush({ id: '1', ...dados });
    });
  });

  describe('atualizar', () => {
    it('should PATCH /produtos/:id', () => {
      const id = 'abc-123';
      const dados = { nome: 'Produto Atualizado' };
      service.atualizar(id, dados).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dados);
      req.flush({ id, ...dados });
    });
  });

  describe('desativar', () => {
    it('should DELETE /produtos/:id', () => {
      const id = 'abc-123';
      service.desativar(id).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('reativar', () => {
    it('should PATCH /produtos/:id/reativar', () => {
      const id = 'abc-123';
      service.reativar(id).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/${id}/reativar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({ id, ativo: true });
    });
  });

  describe('listarComposicao', () => {
    it('should GET /produtos/:id/composicao', () => {
      const id = 'abc-123';
      service.listarComposicao(id).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/${id}/composicao`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('substituirComposicao', () => {
    it('should PUT /produtos/:id/composicao', () => {
      const id = 'abc-123';
      const composicao: ProdutoComposicaoCreate[] = [
        { ingrediente_id: 'ing-1', quantidade_g: 200, ordem: 0 },
        { ingrediente_id: 'ing-2', quantidade_g: 150, ordem: 1 },
      ];
      service.substituirComposicao(id, composicao).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/produtos/${id}/composicao`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(composicao);
      req.flush({ id });
    });
  });
});
