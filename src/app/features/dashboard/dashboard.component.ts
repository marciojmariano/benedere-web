import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonModule, AsyncPipe],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold" style="color: #e75d23">
        Bem-vindo ao Benedere! 🥗
      </h1>
      <p class="text-gray-500 mt-2">Você está autenticado.</p>
      <p class="mt-2">Usuário: {{ (user$ | async)?.email }}</p>
      <p-button
        label="Sair"
        icon="pi pi-sign-out"
        severity="danger"
        [text]="true"
        class="mt-4"
        (onClick)="logout()"
      />
    </div>
  `,
})
export class DashboardComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}