import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PedidoService } from './pedido.service';
import { StatusPedido } from '../models';
import { environment } from '../../../environments/environment';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PedidoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should GET /pedidos/ without params when none provided', () => {
      service.listar().subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([]);
    });

    it('should pass status param when provided', () => {
      service.listar(StatusPedido.APROVADO).subscribe();
      const req = httpMock.expectOne(r => r.url === `${baseUrl}/pedidos/`);
      expect(req.request.params.get('status')).toBe('aprovado');
      req.flush([]);
    });

    it('should pass both status and clienteId params', () => {
      service.listar(StatusPedido.RASCUNHO, 'cli-123').subscribe();
      const req = httpMock.expectOne(r => r.url === `${baseUrl}/pedidos/`);
      expect(req.request.params.get('status')).toBe('rascunho');
      expect(req.request.params.get('cliente_id')).toBe('cli-123');
      req.flush([]);
    });
  });

  describe('buscarPorId', () => {
    it('should GET /pedidos/:id', () => {
      service.buscarPorId('ped-1').subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/ped-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 'ped-1' });
    });
  });

  describe('criar', () => {
    it('should POST /pedidos/', () => {
      const dados = { cliente_id: 'cli-1', markup_id: 'mk-1', observacoes: 'Teste' };
      service.criar(dados).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dados);
      req.flush({ id: 'ped-1', ...dados });
    });
  });

  describe('atualizar', () => {
    it('should PATCH /pedidos/:id', () => {
      service.atualizar('ped-1', { observacoes: 'Atualizado' }).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/ped-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ observacoes: 'Atualizado' });
      req.flush({ id: 'ped-1' });
    });
  });

  describe('deletar', () => {
    it('should DELETE /pedidos/:id', () => {
      service.deletar('ped-1').subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/ped-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('mudarStatus', () => {
    it('should PATCH /pedidos/:id/status with status body', () => {
      service.mudarStatus('ped-1', StatusPedido.APROVADO).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/ped-1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'aprovado' });
      req.flush({ id: 'ped-1', status: 'aprovado' });
    });
  });

  describe('adicionarItem', () => {
    it('should POST /pedidos/:id/itens', () => {
      const item = { produto_id: 'prod-1', quantidade: 2, tipo: 'serie' };
      service.adicionarItem('ped-1', item).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/ped-1/itens`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(item);
      req.flush({ id: 'ped-1' });
    });
  });

  describe('removerItem', () => {
    it('should DELETE /pedidos/:id/itens/:itemId', () => {
      service.removerItem('ped-1', 'item-1').subscribe();
      const req = httpMock.expectOne(`${baseUrl}/pedidos/ped-1/itens/item-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ id: 'ped-1' });
    });
  });
});
