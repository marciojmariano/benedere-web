// ── Enums ─────────────────────────────────────────────────────────────────────

export enum UnidadeMedida {
  KG = 'KG',
  G = 'G',
  ML = 'ML',
  L = 'L',
  UNIDADE = 'UNIDADE',
}

export enum TipoRefeicao {
  CAFE_MANHA = 'CAFE_MANHA',
  LANCHE_MANHA = 'LANCHE_MANHA',
  ALMOCO = 'ALMOCO',
  LANCHE_TARDE = 'LANCHE_TARDE',
  JANTAR = 'JANTAR',
}

export enum StatusPedido {
  RASCUNHO = 'RASCUNHO',
  APROVADO = 'APROVADO',
  EM_PRODUCAO = 'EM_PRODUCAO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export enum TipoItem {
  SERIE = 'SERIE',
  PERSONALIZADO = 'PERSONALIZADO',
}

export enum TipoIngrediente {
  INSUMO = 'INSUMO',
  EMBALAGEM = 'EMBALAGEM',
}

export enum TipoMovimentacao {
  COMPRA = 'COMPRA',
  ENTRADA_PRODUCAO = 'ENTRADA_PRODUCAO',
  AJUSTE_ENTRADA = 'AJUSTE_ENTRADA',
  VENDA_DEVOLUCAO = 'VENDA_DEVOLUCAO',
  VENDA = 'VENDA',
  SAIDA_PRODUCAO = 'SAIDA_PRODUCAO',
  AJUSTE_SAIDA = 'AJUSTE_SAIDA',
  COMPRA_DEVOLUCAO = 'COMPRA_DEVOLUCAO',
}

export const TIPO_MOVIMENTACAO_LABELS: Record<TipoMovimentacao, string> = {
  [TipoMovimentacao.COMPRA]: 'Compra',
  [TipoMovimentacao.ENTRADA_PRODUCAO]: 'Entrada Produção',
  [TipoMovimentacao.AJUSTE_ENTRADA]: 'Ajuste Entrada',
  [TipoMovimentacao.VENDA_DEVOLUCAO]: 'Devolução de Venda',
  [TipoMovimentacao.VENDA]: 'Venda',
  [TipoMovimentacao.SAIDA_PRODUCAO]: 'Saída Produção',
  [TipoMovimentacao.AJUSTE_SAIDA]: 'Ajuste Saída',
  [TipoMovimentacao.COMPRA_DEVOLUCAO]: 'Devolução de Compra',
};

// ── Labels para exibição ─────────────────────────────────────────────────────

export const TIPO_REFEICAO_LABELS: Record<TipoRefeicao, string> = {
  [TipoRefeicao.CAFE_MANHA]: 'Café da Manhã',
  [TipoRefeicao.LANCHE_MANHA]: 'Lanche Manhã',
  [TipoRefeicao.ALMOCO]: 'Almoço',
  [TipoRefeicao.LANCHE_TARDE]: 'Lanche Tarde',
  [TipoRefeicao.JANTAR]: 'Jantar',
};

export const TIPO_REFEICAO_META = [
  { value: TipoRefeicao.CAFE_MANHA,   label: 'Café da Manhã', emoji: '☕', selectedClass: 'bg-amber-100 text-amber-700 ring-amber-200' },
  { value: TipoRefeicao.LANCHE_MANHA, label: 'Lanche Manhã',  emoji: '🍎', selectedClass: 'bg-orange-100 text-orange-700 ring-orange-200' },
  { value: TipoRefeicao.ALMOCO,       label: 'Almoço',         emoji: '🍱', selectedClass: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  { value: TipoRefeicao.LANCHE_TARDE, label: 'Lanche Tarde',   emoji: '🥪', selectedClass: 'bg-sky-100 text-sky-700 ring-sky-200' },
  { value: TipoRefeicao.JANTAR,       label: 'Jantar',         emoji: '🌙', selectedClass: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
];

export const STATUS_PEDIDO_LABELS: Record<StatusPedido, string> = {
  [StatusPedido.RASCUNHO]: 'Rascunho',
  [StatusPedido.APROVADO]: 'Aprovado',
  [StatusPedido.EM_PRODUCAO]: 'Em Produção',
  [StatusPedido.ENTREGUE]: 'Entregue',
  [StatusPedido.CANCELADO]: 'Cancelado',
};

export const STATUS_PEDIDO_SEVERITY: Record<StatusPedido, string> = {
  [StatusPedido.RASCUNHO]: 'secondary',
  [StatusPedido.APROVADO]: 'info',
  [StatusPedido.EM_PRODUCAO]: 'warn',
  [StatusPedido.ENTREGUE]: 'success',
  [StatusPedido.CANCELADO]: 'danger',
};

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
  markup_id_padrao: string | null;
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
  tipo: TipoIngrediente;
  unidade_medida: UnidadeMedida;
  custo_unitario: string;
  saldo_atual: string;
  descricao: string | null;
  markup_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id: string;
  ingrediente_id: string;
  ingrediente_nome: string;
  tipo: TipoMovimentacao;
  quantidade: string;
  preco_unitario_custo: string;
  data_movimentacao: string;
  observacoes: string | null;
  created_at: string;
}

export interface ImportacaoLinhaErro {
  linha: number;
  ingrediente_nome: string;
  mensagem: string;
}

export interface ImportacaoEstoqueResponse {
  total_linhas: number;
  importadas: number;
  erros: ImportacaoLinhaErro[];
}

export interface EntradaEstoqueCreate {
  ingrediente_id: string;
  quantidade: number;
  preco_unitario_custo: number;
  data_movimentacao: string;
  observacoes?: string | null;
}

export interface FaixaPesoEmbalagem {
  id: string;
  peso_min_g: number;
  peso_max_g: number;
  ingrediente_embalagem_id: string;
  ingrediente_embalagem_nome: string;
  ingrediente_embalagem_custo: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ── Produto (Catálogo) ───────────────────────────────────────────────────────

export interface ProdutoComposicao {
  id: string;
  ingrediente_id: string;
  ingrediente_nome: string | null;
  ingrediente_custo_unitario: string | null;
  quantidade_g: string;
  ordem: number;
  custo_item: string | null;
  kcal_item: string | null;
}

export interface Produto {
  id: string;
  nome: string;
  tipo_refeicao: TipoRefeicao | null;
  peso_total_g: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdutoDetalhe extends Produto {
  composicao: ProdutoComposicao[];
  custo_total: string | null;
  kcal_total: string | null;
}

// ── Pedido (Unificado) ──────────────────────────────────────────────────────

export interface PedidoItemComposicao {
  id: string;
  ingrediente_id: string;
  ingrediente_nome_snap: string;
  quantidade_g: string;
  custo_kg_snapshot: string;
  kcal_snapshot: string;
}

export interface PedidoItem {
  id: string;
  produto_id: string | null;
  nome_snapshot: string;
  tipo_refeicao: TipoRefeicao | null;
  tipo: TipoItem;
  quantidade: number;
  preco_unitario: string;
  preco_total: string;
  composicao: PedidoItemComposicao[];
  embalagem_ingrediente_id: string | null;
  embalagem_nome_snapshot: string | null;
  embalagem_custo_snapshot: string | null;
}

export interface Pedido {
  id: string;
  numero: string;
  cliente_id: string;
  markup_id: string | null;
  status: StatusPedido;
  valor_total: string;
  observacoes: string | null;
  data_entrega_prevista: string | null;
  data_entrega_realizada: string | null;
  itens: PedidoItem[];
  created_at: string;
  updated_at: string;
}

export interface PedidoResumo {
  id: string;
  numero: string;
  cliente_id: string;
  status: StatusPedido;
  valor_total: string;
  total_itens: number;
  created_at: string;
}

// ── Paginação ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
