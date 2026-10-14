import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authService = inject(AuthService);

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: readonly string[]): boolean {
    return this.authService.hasAnyRole([...roles]);
  }
}