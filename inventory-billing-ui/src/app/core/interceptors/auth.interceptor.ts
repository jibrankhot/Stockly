import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { TokenService } from '../auth/services/token.service';
import { API_CONFIG } from '../http/api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getAccessToken();

  const baseUrl = API_CONFIG.baseUrl.replace(/\/+$/, '');

  const isApiRequest =
    req.url === baseUrl ||
    req.url.startsWith(`${baseUrl}/`);

  if (!token || !isApiRequest) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};