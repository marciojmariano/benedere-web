import { Component } from '@angular/core';
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
    .active-link {
      background-color: #e75d23 !important;
      color: white !important;
    }
    .active-link i {
      color: white !important;
    }
  `],
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/' },
    { label: 'Clientes', icon: 'pi pi-users', route: '/clientes' },
    { label: 'Nutricionistas', icon: 'pi pi-heart', route: '/nutricionistas' },
    { label: 'Ingredientes', icon: 'pi pi-box', route: '/ingredientes' },
    { label: 'Markups', icon: 'pi pi-percentage', route: '/markups' },
    { label: 'Orçamentos', icon: 'pi pi-file', route: '/orcamentos' },
    { label: 'Pedidos', icon: 'pi pi-shopping-cart', route: '/pedidos' },
  ];
}
