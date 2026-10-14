import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '../auth/services/token.service';
import { API_CONFIG } from '../http/api.config';

const API_BASE_URL = API_CONFIG.baseUrl.replace(/\/+$/, '');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest =
    req.url === API_BASE_URL ||
    req.url.startsWith(`${API_BASE_URL}/`);

  if (!isApiRequest) {
    return next(req);
  }

  const token = inject(TokenService).getAccessToken();

  if (!token?.trim()) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};