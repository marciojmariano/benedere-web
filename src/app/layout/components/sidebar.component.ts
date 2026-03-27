import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styles: [`
    :host {
      display: block;
    }
    .active-link {
      background-color: #059669 !important;
      color: white !important;
    }
    .active-link i {
      color: white !important;
    }
    .sidebar-transition {
      transition: width 200ms ease-in-out;
    }
  `],
})
export class SidebarComponent {
  collapsed = input(false);
  collapsedChange = output<boolean>();

  menuGroups: MenuGroup[] = [
    {
      label: '',
      items: [
        { label: 'Dashboard', icon: 'pi pi-home', route: '/' },
      ],
    },
    {
      label: 'Cadastros',
      items: [
        { label: 'Clientes', icon: 'pi pi-users', route: '/clientes' },
        { label: 'Nutricionistas', icon: 'pi pi-heart', route: '/nutricionistas' },
      ],
    },
    {
      label: 'Produtos',
      items: [
        { label: 'Produtos', icon: 'pi pi-tag', route: '/produtos' },
        { label: 'Ingredientes', icon: 'pi pi-box', route: '/ingredientes' },
        { label: 'Estoque', icon: 'pi pi-warehouse', route: '/estoque' },
      ],
    },
    {
      label: 'Precificação',
      items: [
        { label: 'Índices de Markup', icon: 'pi pi-list', route: '/indices-markup' },
        { label: 'Markups', icon: 'pi pi-percentage', route: '/markups' },
        { label: 'Embalagens', icon: 'pi pi-inbox', route: '/embalagens' },
      ],
    },
    {
      label: 'Pedidos',
      items: [
        { label: 'Pedidos', icon: 'pi pi-shopping-cart', route: '/pedidos' },
      ],
    },
    {
      label: 'Produção',
      items: [
        { label: 'Ordem de Produção', icon: 'pi pi-clipboard', route: '/producao' },
        { label: 'Montagem', icon: 'pi pi-list-check', route: '/producao/mapa-montagem' },
      ],
    },
  ];

  toggleCollapse(): void {
    this.collapsedChange.emit(!this.collapsed());
  }
}
