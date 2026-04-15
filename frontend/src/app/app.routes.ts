import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/components/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes-list.component').then((m) => m.ClientesListComponent),
      },
      {
        path: 'clientes/novo',
        loadComponent: () =>
          import('./features/clientes/cliente-form.component').then((m) => m.ClienteFormComponent),
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./features/clientes/cliente-form.component').then((m) => m.ClienteFormComponent),
      },
      {
        path: 'nutricionistas',
        loadComponent: () =>
          import('./features/nutricionistas/nutricionistas-list.component').then((m) => m.NutricionistasListComponent),
      },
      {
        path: 'nutricionistas/novo',
        loadComponent: () =>
          import('./features/nutricionistas/nutricionista-form.component').then((m) => m.NutricionistaFormComponent),
      },
      {
        path: 'nutricionistas/:id',
        loadComponent: () =>
          import('./features/nutricionistas/nutricionista-form.component').then((m) => m.NutricionistaFormComponent),
      },
      {
        path: 'ingredientes',
        loadComponent: () =>
          import('./features/ingredientes/ingredientes-list.component').then((m) => m.IngredientesListComponent),
      },
      {
        path: 'ingredientes/novo',
        loadComponent: () =>
          import('./features/ingredientes/ingrediente-form.component').then((m) => m.IngredienteFormComponent),
      },
      {
        path: 'ingredientes/:id',
        loadComponent: () =>
          import('./features/ingredientes/ingrediente-form.component').then((m) => m.IngredienteFormComponent),
      },
      // ── Produtos (catálogo) ──────────────────────────────────────────────
      {
        path: 'produtos',
        loadComponent: () =>
          import('./features/produtos/produtos-list.component').then((m) => m.ProdutosListComponent),
      },
      {
        path: 'produtos/novo',
        loadComponent: () =>
          import('./features/produtos/produto-form.component').then((m) => m.ProdutoFormComponent),
      },
      {
        path: 'produtos/:id',
        loadComponent: () =>
          import('./features/produtos/produto-form.component').then((m) => m.ProdutoFormComponent),
      },
      // ── Markups ──────────────────────────────────────────────────────────
      {
        path: 'markups',
        loadComponent: () =>
          import('./features/markups/markups-list.component').then((m) => m.MarkupsListComponent),
      },
      {
        path: 'markups/novo',
        loadComponent: () =>
          import('./features/markups/markup-form.component').then((m) => m.MarkupFormComponent),
      },
      {
        path: 'markups/:id',
        loadComponent: () =>
          import('./features/markups/markup-form.component').then((m) => m.MarkupFormComponent),
      },
      {
        path: 'indices-markup',
        loadComponent: () =>
          import('./features/markups/indice-markup-list.component').then((m) => m.IndiceMarkupListComponent),
      },
      {
        path: 'indices-markup/novo',
        loadComponent: () =>
          import('./features/markups/indice-markup-form.component').then((m) => m.IndiceMarkupFormComponent),
      },
      {
        path: 'indices-markup/:id',
        loadComponent: () =>
          import('./features/markups/indice-markup-form.component').then((m) => m.IndiceMarkupFormComponent),
      },
      // ── Embalagens ─────────────────────────────────────────────────────
      {
        path: 'embalagens',
        loadComponent: () =>
          import('./features/embalagens/embalagens-config.component').then((m) => m.EmbalagensConfigComponent),
      },
      // ── Etiquetas ──────────────────────────────────────────────────────
      {
        path: 'etiquetas',
        loadComponent: () =>
          import('./features/etiquetas/etiqueta-editor.component').then((m) => m.EtiquetaEditorComponent),
      },
      // ── Estoque ────────────────────────────────────────────────────────
      {
        path: 'estoque',
        loadComponent: () =>
          import('./features/estoque/estoque-list.component').then((m) => m.EstoqueListComponent),
      },
      {
        path: 'estoque/nova-entrada',
        loadComponent: () =>
          import('./features/estoque/entrada-form.component').then((m) => m.EntradaFormComponent),
      },
      {
        path: 'estoque/importar',
        loadComponent: () =>
          import('./features/estoque/entrada-import.component').then((m) => m.EntradaImportComponent),
      },
      // ── Produção (BOM + Mapa de Montagem) ──────────────────────────────
      {
        path: 'producao',
        loadComponent: () =>
          import('./features/producao/producao-explosao.component').then((m) => m.ProducaoExplosaoComponent),
      },
      {
        path: 'producao/mapa-montagem',
        loadComponent: () =>
          import('./features/producao/mapa-montagem.component').then((m) => m.MapaMontagemComponent),
      },
      // ── Pedidos ────────────────────────────────────────────────────────
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/pedidos/pedidos-list.component').then((m) => m.PedidosListComponent),
      },
      {
        path: 'pedidos/novo',
        loadComponent: () =>
          import('./features/pedidos/pedido-form.component').then((m) => m.PedidoFormComponent),
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./features/pedidos/pedido-detail.component').then((m) => m.PedidoDetailComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
