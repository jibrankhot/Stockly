
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { TokenService } from '../auth/services/token.service';

let isHandlingUnauthorized = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);

  const isLoginRequest = req.url.includes('/auth/login');

  return next(req).pipe(
    tap(() => {
      // Reset the session handler after a successful login.
      if (isLoginRequest) {
        isHandlingUnauthorized = false;
      }
    }),

    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Let the login page handle invalid credentials.
          if (isLoginRequest) {
            break;
          }

          tokenService.clearTokens();

          // Avoid duplicate notifications and redirects.
          if (!isHandlingUnauthorized) {
            isHandlingUnauthorized = true;

            notificationService.error(
              'Your session has expired or is no longer valid. Please log in again.'
            );

            if (!router.url.startsWith('/auth/login')) {
              router.navigate(['/auth/login']);
            }
          }
          break;

        case 403:
          notificationService.error(
            'You do not have permission to perform this action.'
          );
          break;

        case 404:
          notificationService.error(
            'The requested resource was not found.'
          );
          break;

        case 422:
          notificationService.error(
            'Please check the submitted information.'
          );
          break;

        case 500:
          notificationService.error(
            'A server error occurred. Please try again later.'
          );
          break;

        case 0:
          notificationService.error(
            'Unable to connect to the server.'
          );
          break;

        default:
          notificationService.error(
            error.error?.message ||
            'Something went wrong. Please try again.'
          );
      }

      return throwError(() => error);
    })
  );
};