import { Component, inject, output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { environment } from '../../../environments/environment';
import { filter, map, startWith } from 'rxjs/operators';

interface Breadcrumb {
  icon: string;
  label: string;
}

const ROUTE_MAP: Record<string, Breadcrumb> = {
  '/': { icon: 'pi pi-home', label: 'Dashboard' },
  '/clientes': { icon: 'pi pi-users', label: 'Clientes' },
  '/nutricionistas': { icon: 'pi pi-heart', label: 'Nutricionistas' },
  '/ingredientes': { icon: 'pi pi-box', label: 'Ingredientes' },
  '/produtos': { icon: 'pi pi-tag', label: 'Produtos' },
  '/indices-markup': { icon: 'pi pi-list', label: 'Índices de Markup' },
  '/markups': { icon: 'pi pi-percentage', label: 'Markups' },
  '/pedidos': { icon: 'pi pi-shopping-cart', label: 'Pedidos' },
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, AvatarModule],
  template: `
    <header class="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200 shadow-sm">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2">
        <button
          class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors lg:hidden"
          (click)="menuToggle.emit()"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>
        @if (breadcrumb$ | async; as bc) {
          <div class="flex items-center gap-2 text-zinc-500">
            <i [class]="bc.icon"></i>
            <span class="text-sm font-semibold text-zinc-700">{{ bc.label }}</span>
          </div>
        }
      </div>

      <!-- User -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-zinc-500 hidden sm:block">{{ (user$ | async)?.email }}</span>
        <p-avatar
          [label]="getInitials((user$ | async)?.email)"
          shape="circle"
          [style]="{ 'background-color': '#059669', color: '#fff' }"
        />
        <p-button
          icon="pi pi-sign-out"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          pTooltip="Sair"
          (onClick)="logout()"
        />
      </div>

    </header>
  `,
})
export class TopbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuToggle = output<void>();
  user$ = this.auth.user$;

  breadcrumb$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const url = this.router.url.split('?')[0];
      const baseRoute = '/' + (url.split('/')[1] || '');
      return ROUTE_MAP[baseRoute] || ROUTE_MAP['/'];
    })
  );

  getInitials(email: string | null | undefined): string {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: environment.auth0.logoutUrl } });
  }
}
