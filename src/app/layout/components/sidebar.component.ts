import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';


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
  imports: [RouterLink, RouterLinkActive, IconComponent],
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
  sidebarOpen = signal(true);
  menuGroups: MenuGroup[] = [
    {
      label: '',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/' },
      ],
    },
    {
      label: 'Cadastros',
      items: [
        { label: 'Clientes', icon: 'users', route: '/clientes' },
        { label: 'Nutricionistas', icon: 'heart', route: '/nutricionistas' },
      ],
    },
    {
      label: 'Produtos',
      items: [
        { label: 'Produtos', icon: 'tag', route: '/produtos' },
        { label: 'Ingredientes', icon: 'leaf', route: '/ingredientes' },
        { label: 'Estoque', icon: 'box', route: '/estoque' },
      ],
    },
    {
      label: 'Precificação',
      items: [
        { label: 'Índices de Markup', icon: 'list', route: '/indices-markup' },
        { label: 'Markups', icon: 'percentage', route: '/markups' },
        { label: 'Embalagens', icon: 'inbox', route: '/embalagens' },
      ],
    },
    {
      label: 'Pedidos',
      items: [
        { label: 'Pedidos', icon: 'shopping-cart', route: '/pedidos' },
      ],
    },
    {
      label: 'Produção',
      items: [
        { label: 'Ordem de Produção', icon: 'clipboard', route: '/producao' },
        { label: 'Montagem', icon: 'list-check', route: '/producao/mapa-montagem' },
      ],
    },
  ];

  toggleCollapse(): void {
    this.collapsedChange.emit(!this.collapsed());
  }
}
