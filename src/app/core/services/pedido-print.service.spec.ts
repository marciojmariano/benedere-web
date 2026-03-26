import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PedidoPrintService } from './pedido-print.service';
import { Pedido, Cliente, StatusPedido, TipoItem, TipoRefeicao } from '../models/index';

const mockCliente: Cliente = {
  id: 'c1',
  nome: 'Maria Souza',
  email: 'maria@email.com',
  telefone: '11999999999',
  endereco: 'Rua A, 10',
  observacoes: null,
  ativo: true,
  nutricionista_id: null,
  markup_id_padrao: null,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
};

const mockPedido: Pedido = {
  id: 'p1',
  numero: 'PED-2026-0001',
  cliente_id: 'c1',
  markup_id: null,
  status: StatusPedido.APROVADO,
  valor_total: '128.00',
  observacoes: 'Entregar pela manhã',
  data_entrega_prevista: '2026-04-01T10:00:00',
  data_entrega_realizada: null,
  created_at: '2026-03-20T14:00:00',
  updated_at: '2026-03-20T14:00:00',
  itens: [
    {
      id: 'i1',
      produto_id: 'prod1',
      nome_snapshot: 'Marmita Fitness',
      tipo_refeicao: TipoRefeicao.ALMOCO,
      tipo: TipoItem.SERIE,
      quantidade: 2,
      preco_unitario: '45.00',
      preco_total: '90.00',
      composicao: [
        { id: 'comp1', ingrediente_id: 'ing1', ingrediente_nome_snap: 'Frango', quantidade_g: '150', custo_kg_snapshot: '25.00', kcal_snapshot: '0' },
        { id: 'comp2', ingrediente_id: 'ing2', ingrediente_nome_snap: 'Arroz Integral', quantidade_g: '120', custo_kg_snapshot: '8.00', kcal_snapshot: '0' },
      ],
      embalagem_ingrediente_id: null,
      embalagem_nome_snapshot: null,
      embalagem_custo_snapshot: null,
    },
    {
      id: 'i2',
      produto_id: null,
      nome_snapshot: 'Low Carb',
      tipo_refeicao: null,
      tipo: TipoItem.PERSONALIZADO,
      quantidade: 1,
      preco_unitario: '38.00',
      preco_total: '38.00',
      composicao: [],
      embalagem_ingrediente_id: null,
      embalagem_nome_snapshot: null,
      embalagem_custo_snapshot: null,
    },
  ],
};

describe('PedidoPrintService', () => {
  let service: PedidoPrintService;
  let mockWindow: {
    document: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };
    focus: ReturnType<typeof vi.fn>;
    print: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoPrintService);

    mockWindow = {
      document: { write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a new window with blank target', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    expect(window.open).toHaveBeenCalledWith('', '_blank');
  });

  it('should return false when popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const result = service.imprimir(mockPedido, mockCliente);
    expect(result).toBe(false);
  });

  it('should return true when window opens successfully', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    const result = service.imprimir(mockPedido, mockCliente);
    expect(result).toBe(true);
  });

  it('should write HTML containing the pedido number', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('PED-2026-0001');
  });

  it('should write HTML containing the client name', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Maria Souza');
  });

  it('should include all item names in the HTML', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Marmita Fitness');
    expect(html).toContain('Low Carb');
  });

  it('should include composition details for items with composicao', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Frango');
    expect(html).toContain('150g');
    expect(html).toContain('Arroz Integral');
    expect(html).toContain('120g');
  });

  it('should format currency values as BRL', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('R$');
  });

  it('should include status label', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Aprovado');
  });

  it('should include observations when present', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Observações');
    expect(html).toContain('Entregar pela manhã');
  });

  it('should not include observations section when null', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    const pedidoSemObs = { ...mockPedido, observacoes: null };
    service.imprimir(pedidoSemObs, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).not.toContain('Observações');
  });

  it('should include tipo refeicao label when present', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Almoço');
  });

  it('should include delivery date when present', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Entrega Prevista');
  });

  it('should not include delivery date when null', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    const pedidoSemEntrega = { ...mockPedido, data_entrega_prevista: null };
    service.imprimir(pedidoSemEntrega, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).not.toContain('Entrega Prevista');
  });

  it('should call window.print after delay', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);

    expect(mockWindow.print).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(mockWindow.print).toHaveBeenCalled();
    expect(mockWindow.close).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should show serie and personalizado badges', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('Série');
    expect(html).toContain('Personalizado');
  });

  it('should show client phone as contact when available', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    service.imprimir(mockPedido, mockCliente);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    expect(html).toContain('11999999999');
  });

  it('should show dash when client has no contact', () => {
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    const clienteSemContato = { ...mockCliente, telefone: null, email: null };
    service.imprimir(mockPedido, clienteSemContato);
    const html = mockWindow.document.write.mock.calls[0][0] as string;
    // The contact info-value should contain '—'
    expect(html).toContain('—');
  });
});
