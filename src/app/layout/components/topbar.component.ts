import { Component, inject, output, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

// Benedere Imports
import { environment } from '../../../environments/environment';
import { IconComponent } from '../../shared/components/icon.component';

interface Breadcrumb {
  icon: string;
  label: string;
}

const ROUTE_MAP: Record<string, Breadcrumb> = {
  '/': { icon: 'dashboard', label: 'Dashboard' },
  '/dashboard': { icon: 'dashboard', label: 'Dashboard' },
  '/clientes': { icon: 'users', label: 'Clientes' },
  '/nutricionistas': { icon: 'heart', label: 'Nutricionistas' },
  '/ingredientes': { icon: 'leaf', label: 'Ingredientes' },
  '/produtos': { icon: 'tag', label: 'Produtos' },
  '/indices-markup': { icon: 'list', label: 'Índices de Markup' },
  '/markups': { icon: 'percentage', label: 'Markups' },
  '/embalagens': { icon: 'inbox', label: 'Embalagens' },
  '/pedidos': { icon: 'shopping-cart', label: 'Pedidos' },
  '/producao': { icon: 'clipboard', label: 'Produção' },
  '/producao/mapa-montagem': { icon: 'list-check', label: 'Mapa de Montagem' },
  '/estoque': { icon: 'box', label: 'Estoque' }
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, AvatarModule, TooltipModule, IconComponent],
  host: {
    'attr.data-component-id': 'topbar-reactive'
  },
  template: `
    <header class="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200 shadow-sm">
      
      <div class="flex items-center gap-2">
        <button
          class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors lg:hidden"
          (click)="menuToggle.emit()"
        >
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <div class="flex items-center gap-2 text-zinc-500">
          <app-icon [name]="currentBc().icon" [size]="18" class="text-emerald-600"></app-icon>
          <span class="text-sm font-semibold text-zinc-700">{{ currentBc().label }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-sm text-zinc-500 hidden sm:block">{{ (user$ | async)?.email }}</span>
        
        <p-avatar
          [label]="getInitials((user$ | async)?.email)"
          shape="circle"
          [style]="{ 'background-color': '#10b981', color: '#fff' }"
        />

        <p-button
          [text]="true"
          [rounded]="true"
          severity="secondary"
          pTooltip="Sair"
          tooltipPosition="bottom"
          (onClick)="logout()"
        >
          <app-icon name="logOut" [size]="20" class="text-zinc-400 hover:text-red-500"></app-icon>
        </p-button>
      </div>

    </header>
  `,
})
export class TopbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuToggle = output<void>();
  user$ = this.auth.user$;

  // 1. Transformamos os eventos de rota em um Signal que o Angular vigia nativamente
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects.split('?')[0])
    ),
    { initialValue: this.router.url.split('?')[0] }
  );

  // 2. O Breadcrumb é derivado automaticamente da URL. Se a URL muda, ele muda.
  currentBc = computed<Breadcrumb>(() => {
    const url = this.currentUrl();
    const baseRoute = '/' + (url.split('/')[1] || '');
    
    // Busca no mapa: Rota completa -> Rota Base -> Dashboard (fallback)
    return ROUTE_MAP[url] || ROUTE_MAP[baseRoute] || ROUTE_MAP['/'];
  });

  getInitials(email: string | null | undefined): string {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout({ 
      logoutParams: { returnTo: environment.auth0.logoutUrl } 
    });
  }
}