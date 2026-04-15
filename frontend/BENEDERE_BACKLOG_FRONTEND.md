# Benedere SaaS — Backlog Frontend

> **Versão:** 1.0 • **Data:** Março 2026
> **Stack:** Angular 19 + PrimeNG v21 + Tailwind CSS v3
> **Pré-requisito:** Backlog Backend (Épicos 1-3 concluídos)
>
> **Status:** ⬜ Pendente | 🔄 Em andamento | ✅ Concluído

---

## Épico 1 — Módulo Produto (Catálogo)

> Telas Angular para CRUD de produto e gestão da receita (composição).

### US 1.1 — Listagem e CRUD de Produto

**Como** administrador, **quero** visualizar, criar e editar produtos do catálogo na interface, **para que** eu gerencie meu portfólio sem depender de API direta.

| # | Task | SP | Status |
|---|------|----|--------|
| 1.1.1 | Criar `ProdutoService` Angular (HTTP client) | 2 | ⬜ Pendente |
| 1.1.2 | Criar `produto-list.component` com tabela PrimeNG (busca global, paginação, filtro por tipo_refeicao) | 3 | ⬜ Pendente |
| 1.1.3 | Criar `produto-form.component` (nome, tipo_refeicao select, ativo toggle) | 3 | ⬜ Pendente |
| 1.1.4 | Registrar rotas lazy-loaded: `/produtos`, `/produtos/novo`, `/produtos/:id/editar` | 1 | ⬜ Pendente |
| 1.1.5 | Adicionar link no sidebar | 1 | ⬜ Pendente |
| | **Subtotal** | **10** | |

### US 1.2 — Editor de composição (receita)

**Como** administrador, **quero** montar a receita de um produto selecionando ingredientes e quantidades, **para que** eu defina o custo base e peso do produto.

| # | Task | SP | Status |
|---|------|----|--------|
| 1.2.1 | Criar `produto-composicao.component` (sub-rota de produto-form ou seção expandida) | 3 | ⬜ Pendente |
| 1.2.2 | Implementar lista dinâmica de ingredientes: dropdown de ingrediente + input de quantidade_g + botão adicionar/remover | 5 | ⬜ Pendente |
| 1.2.3 | Exibir cálculos em tempo real: custo por ingrediente, custo total, peso total, kcal total (via atributos JSONB) | 5 | ⬜ Pendente |
| 1.2.4 | Implementar drag-and-drop para reordenar ingredientes (campo `ordem`) | 3 | ⬜ Pendente |
| 1.2.5 | Salvar composição via `PUT /produtos/{id}/composicao` | 2 | ⬜ Pendente |
| | **Subtotal** | **18** | |

---

## Épico 2 — Módulo Pedido (Unificado)

> Telas Angular para criar e gerenciar pedidos com itens de série e personalizados.

### US 2.1 — Listagem de Pedidos

**Como** operador, **quero** ver todos os pedidos com filtros por status e cliente, **para que** eu acompanhe as vendas em andamento.

| # | Task | SP | Status |
|---|------|----|--------|
| 2.1.1 | Criar `PedidoService` Angular (HTTP client) | 2 | ⬜ Pendente |
| 2.1.2 | Criar `pedido-list.component` com tabela PrimeNG (filtros: status, cliente, data; busca global) | 3 | ⬜ Pendente |
| 2.1.3 | Exibir status com labels coloridos (rascunho=cinza, aprovado=azul, em_producao=laranja, entregue=verde, cancelado=vermelho) | 2 | ⬜ Pendente |
| 2.1.4 | Registrar rotas lazy-loaded: `/pedidos`, `/pedidos/novo`, `/pedidos/:id` | 1 | ⬜ Pendente |
| | **Subtotal** | **8** | |

### US 2.2 — Criação de Pedido (form principal)

**Como** operador, **quero** criar um pedido selecionando cliente e adicionando itens, **para que** eu registre a venda.

| # | Task | SP | Status |
|---|------|----|--------|
| 2.2.1 | Criar `pedido-form.component` (seleção de cliente, markup herdado exibido, status inicial=rascunho) | 3 | ⬜ Pendente |
| 2.2.2 | Exibir resumo do pedido: total de itens, valor total, peso total | 2 | ⬜ Pendente |
| 2.2.3 | Botão "Adicionar item de série" (abre modal/seção de seleção de produto do catálogo) | 3 | ⬜ Pendente |
| 2.2.4 | Botão "Adicionar item personalizado" (abre form de composição manual — US 2.4) | 3 | ⬜ Pendente |
| 2.2.5 | Salvar pedido como rascunho via `POST /pedidos` | 2 | ⬜ Pendente |
| | **Subtotal** | **13** | |

### US 2.3 — Adição de item de série ao pedido

**Como** operador, **quero** selecionar um produto do catálogo e adicioná-lo ao pedido com a receita já preenchida, **para que** eu ganhe agilidade na montagem de pedidos padrão.

| # | Task | SP | Status |
|---|------|----|--------|
| 2.3.1 | Criar `pedido-item-serie.component` (lista de produtos do catálogo com busca + preview da composição) | 3 | ⬜ Pendente |
| 2.3.2 | Ao selecionar produto: preencher automaticamente nome, tipo_refeicao, composição (editável antes de confirmar) | 3 | ⬜ Pendente |
| 2.3.3 | Permitir override de tipo_refeicao (vem como sugestão do catálogo, editável) | 2 | ⬜ Pendente |
| 2.3.4 | Controle de quantidade com recálculo | 1 | ⬜ Pendente |
| | **Subtotal** | **9** | |

### US 2.4 — Montagem de item personalizado (marmita)

**Como** operador, **quero** montar uma marmita personalizada inline no pedido, escolhendo ingredientes, quantidades e tipo de refeição, **para que** o cliente receba uma composição sob medida.

| # | Task | SP | Status |
|---|------|----|--------|
| 2.4.1 | Criar `pedido-item-personalizado.component` (conforme protótipo: nome editável, tipo_refeicao toggle, lista de ingredientes, quantidade ±) | 5 | ⬜ Pendente |
| 2.4.2 | Implementar dropdown de ingredientes com busca (PrimeNG AutoComplete filtrado por tenant) | 3 | ⬜ Pendente |
| 2.4.3 | Exibir por ingrediente: kcal calculado, custo calculado (em tempo real ao alterar gramatura) | 3 | ⬜ Pendente |
| 2.4.4 | Exibir totais do item: peso total, kcal total, preço de venda (custo × markup) | 3 | ⬜ Pendente |
| 2.4.5 | Controle de quantidade (o "2x" do protótipo) com recálculo de preço total | 2 | ⬜ Pendente |
| 2.4.6 | Limite de ingredientes por item (exibir "X restantes" conforme protótipo) | 1 | ⬜ Pendente |
| | **Subtotal** | **17** | |

### US 2.5 — Detalhe e transição de status do pedido

**Como** operador, **quero** visualizar o detalhe de um pedido e avançar seu status, **para que** eu acompanhe a produção e entrega.

| # | Task | SP | Status |
|---|------|----|--------|
| 2.5.1 | Criar `pedido-detail.component` (resumo + lista de itens com composição expandível) | 5 | ⬜ Pendente |
| 2.5.2 | Exibir timeline de status com destaque no atual | 3 | ⬜ Pendente |
| 2.5.3 | Botões de ação contextual por status (aprovar, iniciar produção, marcar entregue, cancelar) via `PATCH /pedidos/{id}/status` | 3 | ⬜ Pendente |
| 2.5.4 | Bloquear edição de itens quando status ≠ rascunho | 2 | ⬜ Pendente |
| | **Subtotal** | **13** | |

---

## Épico 3 — Limpeza Legada (Frontend)

> Remover telas e serviços de Orçamento e Pedido antigo do frontend.

### US 3.1 — Remover módulo Orçamento

**Como** dev, **quero** eliminar as telas de Orçamento do frontend, **para que** a navegação reflita o novo fluxo.

| # | Task | SP | Status |
|---|------|----|--------|
| 3.1.1 | Remover componentes: orcamentos-list, orcamento-form, orcamento-detail | 2 | ⬜ Pendente |
| 3.1.2 | Remover orcamento.service.ts e interfaces relacionadas | 1 | ⬜ Pendente |
| 3.1.3 | Atualizar rotas em `app.routes.ts` (remover /orcamentos/*) | 1 | ⬜ Pendente |
| 3.1.4 | Atualizar sidebar (remover link Orçamentos, adicionar link Produtos) | 1 | ⬜ Pendente |
| | **Subtotal** | **5** | |

### US 3.2 — Remover módulo Pedido antigo

**Como** dev, **quero** remover as telas do Pedido antigo, **para que** o novo módulo assuma completamente.

| # | Task | SP | Status |
|---|------|----|--------|
| 3.2.1 | Remover componentes: pedidos-list (antigo), pedido-detail (antigo) | 2 | ⬜ Pendente |
| 3.2.2 | Remover pedido.service.ts antigo e interfaces | 1 | ⬜ Pendente |
| | **Subtotal** | **3** | |

---

## Resumo Frontend

| Épico | Descrição | US | Total SP |
|-------|-----------|:--:|---------:|
| 1 | Módulo Produto (Catálogo) | 2 | 28 |
| 2 | Módulo Pedido (Unificado) | 5 | 60 |
| 3 | Limpeza legada | 2 | 8 |
| **Total** | | **9 US** | **96 SP** |

---

## Ordem de execução

```
Épico 3 (Limpeza) → Épico 1 (Produto) → Épico 2 (Pedido)
```

> **Dependência crítica:** Backend dos Épicos 1-3 deve estar concluído antes de iniciar o frontend. Limpeza do legado frontend primeiro pra evitar conflitos de rotas e componentes.

---

## Dependência com Backend

```
Backend Épico 1 (DB)
  → Backend Épico 4 (Limpeza)
    → Backend Épico 2 (Produto)  →  Frontend Épico 1 (Produto)
    → Backend Épico 3 (Pedido)   →  Frontend Épico 2 (Pedido)
                                      Frontend Épico 3 (Limpeza) pode rodar em paralelo
```
