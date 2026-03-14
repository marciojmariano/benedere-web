import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, AvatarModule, MenuModule],
  template: `
    <header class="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">

      <!-- Título da página -->
      <div>
        <h2 class="text-lg font-semibold text-gray-700">{{ title }}</h2>
      </div>

      <!-- Usuário -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">{{ (user$ | async)?.email }}</span>
        <p-avatar
          [label]="getInitials((user$ | async)?.email)"
          shape="circle"
          [style]="{ 'background-color': '#e75d23', color: '#fff' }"
        />
        <p-button
          icon="pi pi-sign-out"
          [text]="true"
          [rounded]="true"
          severity="danger"
          pTooltip="Sair"
          (onClick)="logout()"
        />
      </div>

    </header>
  `,
})
export class TopbarComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;
  title = 'Benedere';

  getInitials(email: string | null | undefined): string {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: environment.auth0.logoutUrl } });
  }
}