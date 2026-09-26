
import { Injectable } from '@angular/core';
import { StorageService } from '../../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'stockly_access_token';
  private readonly refreshTokenKey = 'stockly_refresh_token';

  constructor(
    private readonly storageService: StorageService
  ) { }

  setAccessToken(token: string): void {
    if (!token || !token.trim()) {
      throw new Error('Access token cannot be empty.');
    }

    this.storageService.setItem(this.tokenKey, token);
  }

  getAccessToken(): string | null {
    return this.storageService.getItem<string>(this.tokenKey);
  }

  removeAccessToken(): void {
    this.storageService.removeItem(this.tokenKey);
  }

  setRefreshToken(token: string): void {
    if (!token || !token.trim()) {
      throw new Error('Refresh token cannot be empty.');
    }

    this.storageService.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem<string>(this.refreshTokenKey);
  }

  removeRefreshToken(): void {
    this.storageService.removeItem(this.refreshTokenKey);
  }

  hasAccessToken(): boolean {
    const token = this.getAccessToken();

    return typeof token === 'string' && token.trim().length > 0;
  }

  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }
}