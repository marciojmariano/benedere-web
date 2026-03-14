import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authHttpInterceptorFn])
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
    }),
provideAuth0({
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  authorizationParams: environment.auth0.authorizationParams,
  useRefreshTokens: false,
  httpInterceptor: {
    allowedList: [
      {
        uri: `${environment.apiUrl}/*`,
        tokenOptions: {
          authorizationParams: {
            audience: 'https://api.benedere.com.br',
          },
        },
      },
    ],
  },
}),
],
};