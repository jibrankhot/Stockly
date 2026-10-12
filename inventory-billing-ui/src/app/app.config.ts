
import {
  APP_INITIALIZER,
  ApplicationConfig,
  isDevMode,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/auth/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
      ]),
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => {
        return () => authService.initializeSession();
      },
      deps: [AuthService],
      multi: true,
    },

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
