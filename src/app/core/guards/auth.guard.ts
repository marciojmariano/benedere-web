import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, filter, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    map((loading) => {
      if (auth.isAuthenticated$) {
        return true;
      }
      auth.loginWithRedirect();
      return false;
    })
  );
};