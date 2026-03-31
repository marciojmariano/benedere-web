export interface PlaceholderDef {
  key: string;
  label: string;
  category: string;
  sampleValue: string;
}

export const PLACEHOLDERS: PlaceholderDef[] = [
  { key: 'cliente_nome',     label: 'Nome do Cliente',    category: 'Cliente',  sampleValue: 'Maria Silva' },
  { key: 'tipo_refeicao',    label: 'Tipo de Refeição',   category: 'Refeição', sampleValue: 'Almoço' },
  { key: 'data_fabricacao',  label: 'Data de Fabricação', category: 'Datas',    sampleValue: '27/03/2026' },
  { key: 'data_validade',    label: 'Data de Validade',   category: 'Datas',    sampleValue: '30/03/2026' },
  { key: 'empresa_nome',     label: 'Nome da Empresa',    category: 'Empresa',  sampleValue: 'Benedere Fit' },
  { key: 'empresa_cnpj',     label: 'CNPJ da Empresa',    category: 'Empresa',  sampleValue: '12.345.678/0001-90' },
  { key: 'pedido_numero',    label: 'Número do Pedido',   category: 'Pedido',   sampleValue: 'PED-00042' },
];

export const PLACEHOLDER_CATEGORIES = [...new Set(PLACEHOLDERS.map(p => p.category))];

export interface IngredienteEtiquetaSample {
  nome: string;
  peso_g: number;
}

export const SAMPLE_INGREDIENTES: IngredienteEtiquetaSample[] = [
  { nome: 'Frango grelhado', peso_g: 150 },
  { nome: 'Arroz integral',  peso_g: 120 },
  { nome: 'Brócolis',        peso_g: 80  },
  { nome: 'Azeite de oliva', peso_g: 5   },
];
