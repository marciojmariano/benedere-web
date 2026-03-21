import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

const BenederePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.500}',
      600: '{emerald.600}',
      700: '{emerald.700}',
      800: '{emerald.800}',
      900: '{emerald.900}',
      950: '{emerald.950}',
    },
  },
});

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
        preset: BenederePreset,
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