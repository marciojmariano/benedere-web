import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth0 = inject(Auth0Service);

  isAuthenticated$ = this.auth0.isAuthenticated$;
  user$ = this.auth0.user$;
  isLoading$ = this.auth0.isLoading$;

  login(): void {
    this.auth0.loginWithRedirect();
  }

  logout(): void {
    this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  getAccessToken$(): Observable<string> {
    return this.auth0.getAccessTokenSilently();
  }

  getTenantId$(): Observable<string | null> {
    return this.auth0.getAccessTokenSilently().pipe(
      map((token) => {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload['https://api.benedere.com.br/tenant_id'] ?? null;
      })
    );
  }
}