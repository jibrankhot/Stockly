
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../api.config';

type QueryParamValue = string | number | boolean;
type QueryParams = Record<string, QueryParamValue>;

interface RequestOptions {
  headers?: HttpHeaders;
  params?: QueryParams;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl.replace(/\/+$/, '');

  get<T>(
    endpoint: string,
    params?: QueryParams,
  ): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), {
      params: this.buildParams(params),
    });
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, {
      headers: options?.headers,
      params: this.buildParams(options?.params),
    });
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, {
      headers: options?.headers,
      params: this.buildParams(options?.params),
    });
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, {
      headers: options?.headers,
      params: this.buildParams(options?.params),
    });
  }

  delete<T>(
    endpoint: string,
    params?: QueryParams,
  ): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      params: this.buildParams(params),
    });
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.trim().replace(/^\/+/, '');

    if (
      !normalizedEndpoint ||
      /^[a-z][a-z\d+.-]*:/i.test(normalizedEndpoint) ||
      normalizedEndpoint.startsWith('//')
    ) {
      throw new Error(
        'Invalid API endpoint. Provide a relative endpoint path.',
      );
    }

    return `${this.baseUrl}/${normalizedEndpoint}`;
  }

  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    for (const [key, value] of Object.entries(params)) {
      httpParams = httpParams.set(key, String(value));
    }

    return httpParams;
  }
}
