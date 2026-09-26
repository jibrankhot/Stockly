
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { ApiClientService } from '../../http/services/api-client.service';
import { StorageService } from '../../services/storage.service';
import { TokenService } from './token.service';

import { AuthUser } from '../models/auth-user';
import {
  BackendAuthUser,
  LoginResponse
} from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserKey = 'stockly_current_user';

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService
  ) {
    this.loadStoredUser();
  }

  login(request: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.apiClient
      .post<LoginResponse>('/auth/login', request)
      .pipe(
        tap((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Login failed.');
          }

          const backendUser = response.data.user;

          if (!backendUser.is_active) {
            this.logout();
            throw new Error(
              'Your account is inactive. Please contact your administrator.'
            );
          }

          const user = this.mapBackendUser(backendUser);

          this.tokenService.setAccessToken(response.data.token);
          this.setCurrentUser(user);
        })
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
    const user = this.getCurrentUser();

    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();

    return user
      ? roles.some((role) => user.roles.includes(role))
      : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();

    return user
      ? user.permissions.includes(permission)
      : false;
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
    const nameParts = user.full_name?.trim().split(/\s+/) ?? [];

    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ');

    return {
      id: user.id,
      username: user.username,
      email: user.email ?? '',
      firstName,
      lastName,
      fullName: user.full_name,
      roles: user.roles ? [user.roles.name] : [],
      permissions: []
    };
  }
}