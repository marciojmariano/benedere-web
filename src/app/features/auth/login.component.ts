import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="flex justify-content-center align-items-center" style="height: 100vh;">
      <p>Redirecionando para o login seguro...</p>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.loginWithRedirect();
  }
}