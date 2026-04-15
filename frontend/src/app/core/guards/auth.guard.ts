import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, filter, take, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() => auth.isAuthenticated$),
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      auth.loginWithRedirect();
      return false;
    })
  );
};