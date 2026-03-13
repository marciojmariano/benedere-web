import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="text-center p-8 bg-white rounded-2xl shadow-lg w-96">
        <div class="mb-6">
          <h1 class="text-3xl font-bold" style="color: #e75d23">Benedere</h1>
          <p class="text-gray-500 mt-1">Alimentação Saudável e Personalizada</p>
        </div>
        <hr class="mb-6" />
        <p-button
          label="Entrar"
          icon="pi pi-sign-in"
          [rounded]="true"
          size="large"
          (onClick)="login()"
          styleClass="w-full"
        />
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  login(): void {
    this.auth.loginWithRedirect();
  }
}