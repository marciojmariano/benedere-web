// ── Enums ─────────────────────────────────────────────────────────────────────

export enum UnidadeMedida {
  KG = 'kg',
  G = 'g',
  ML = 'ml',
  L = 'l',
  UNIDADE = 'unidade',
}

export enum StatusOrcamento {
  RASCUNHO = 'rascunho',
  ENVIADO = 'enviado',
  APROVADO = 'aprovado',
  REPROVADO = 'reprovado',
  CANCELADO = 'cancelado',
}

export enum StatusPedido {
  AGUARDANDO_PRODUCAO = 'aguardando_producao',
  EM_PRODUCAO = 'em_producao',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Nutricionista {
  id: string;
  nome: string;
  crn: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  observacoes: string | null;
  ativo: boolean;
  nutricionista_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IndiceMarkup {
  id: string;
  nome: string;
  percentual: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Markup {
  id: string;
  nome: string;
  descricao: string | null;
  fator: string;
  ativo: boolean;
  indices: IndiceMarkup[];
  created_at: string;
  updated_at: string;
}

export interface Ingrediente {
  id: string;
  nome: string;
  unidade_medida: UnidadeMedida;
  custo_unitario: string;
  descricao: string | null;
  markup_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrcamentoItem {
  id: string;
  ingrediente_id: string;
  quantidade: string;
  unidade_medida: UnidadeMedida;
  custo_unitario_snapshot: string;
  markup_fator_snapshot: string | null;
  custo_total_item: string;
  preco_item_com_markup: string;
  observacoes: string | null;
}

export interface Orcamento {
  id: string;
  numero: string;
  cliente_id: string;
  status: StatusOrcamento;
  markup_id: string | null;
  custo_ingredientes: string;
  custo_embalagem: string;
  taxa_entrega: string;
  custo_total: string;
  preco_final: string;
  validade_dias: number;
  observacoes: string | null;
  itens: OrcamentoItem[];
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: string;
  ingrediente_id: string;
  nome_ingrediente_snapshot: string;
  quantidade: string;
  unidade_medida: UnidadeMedida;
  custo_unitario_snapshot: string;
  custo_total_item: string;
}

export interface Pedido {
  id: string;
  numero: string;
  orcamento_id: string;
  cliente_id: string;
  status: StatusPedido;
  valor_total: string;
  taxa_entrega: string;
  custo_embalagem: string;
  data_entrega_prevista: string | null;
  data_entrega_realizada: string | null;
  observacoes: string | null;
  itens: PedidoItem[];
  created_at: string;
  updated_at: string;
}

// ── Paginação ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}