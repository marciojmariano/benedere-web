import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
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

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/' },
    { label: 'Clientes', icon: 'pi pi-users', route: '/clientes' },
    { label: 'Nutricionistas', icon: 'pi pi-heart', route: '/nutricionistas' },
    { label: 'Ingredientes', icon: 'pi pi-box', route: '/ingredientes' },
    { label: 'Produtos', icon: 'pi pi-tag', route: '/produtos' },
    { label: 'Índices de Markup', icon: 'pi pi-list', route: '/indices-markup' },
    { label: 'Markups', icon: 'pi pi-percentage', route: '/markups' },
    { label: 'Embalagens', icon: 'pi pi-inbox', route: '/embalagens' },
    { label: 'Estoque', icon: 'pi pi-warehouse', route: '/estoque' },
    { label: 'Pedidos', icon: 'pi pi-shopping-cart', route: '/pedidos' },
  ];

  toggleCollapse(): void {
    this.collapsedChange.emit(!this.collapsed());
  }
}
