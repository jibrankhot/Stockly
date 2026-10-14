import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';

import { ApiClientService } from '../../http/services/api-client.service';
import { ApiResponse } from '../../models/api-response';
import { StorageService } from '../../services/storage.service';
import { AuthUser } from '../models/auth-user';
import { LoginRequest } from '../models/login-request';
import {
  BackendAuthUser,
  LoginResponse,
} from '../models/login-response';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserKey = 'stockly_current_user';

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService,
  ) {
    this.loadStoredUser();
  }

  initializeSession(): Observable<void> {
    if (!this.tokenService.hasAccessToken()) {
      this.logout();
      return of(void 0);
    }

    return this.apiClient
      .get<ApiResponse<BackendAuthUser>>('/auth/me')
      .pipe(
        tap((response) => {
          if (!response?.success || !response.data) {
            throw new Error('Unable to validate the current session.');
          }

          const backendUser = response.data;

          if (!backendUser.is_active) {
            throw new Error('Your account is inactive.');
          }

          this.setCurrentUser(this.mapBackendUser(backendUser));
        }),
        map(() => void 0),
        catchError(() => {
          this.logout();
          return of(void 0);
        }),
      );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiClient
      .post<LoginResponse>('/auth/login', request)
      .pipe(
        tap((response) => {
          if (
            !response?.success ||
            !response.data?.token ||
            !response.data.user
          ) {
            throw new Error(response?.message || 'Login failed.');
          }

          const backendUser = response.data.user;

          if (!backendUser.is_active) {
            throw new Error(
              'Your account is inactive. Please contact your administrator.',
            );
          }

          this.tokenService.setAccessToken(response.data.token);
          this.setCurrentUser(this.mapBackendUser(backendUser));
        }),
        catchError((error: unknown) => {
          this.logout();
          return throwError(() => error);
        }),
      );
  }

  requestPasswordReset(
    email: string,
  ): Observable<ApiResponse<null>> {
    return this.apiClient.post<ApiResponse<null>>(
      '/auth/forgot-password',
      { email },
    );
  }

  resetPassword(
    token: string,
    newPassword: string,
  ): Observable<ApiResponse<null>> {
    return this.apiClient.post<ApiResponse<null>>(
      '/auth/reset-password',
      { token, newPassword },
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.storageService.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasAccessToken();
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;

    return user
      ? roles.some((role) => user.roles.includes(role))
      : false;
  }

  hasPermission(permission: string): boolean {
    return (
      this.currentUserSubject.value?.permissions.includes(permission) ??
      false
    );
  }

  private setCurrentUser(user: AuthUser): void {
    this.storageService.setItem(this.currentUserKey, user);
    this.currentUserSubject.next(user);
  }

  private loadStoredUser(): void {
    if (!this.tokenService.hasAccessToken()) {
      this.storageService.removeItem(this.currentUserKey);
      return;
    }

    const storedUser =
      this.storageService.getItem<AuthUser>(this.currentUserKey);

    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  private mapBackendUser(user: BackendAuthUser): AuthUser {
    const nameParts = user.full_name.trim().split(/\s+/);

    return {
      id: user.id,
      username: user.username,
      email: user.email ?? '',
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' '),
      fullName: user.full_name,
      roles: user.roles ? [user.roles.name] : [],
      permissions: [],
    };
  }
}