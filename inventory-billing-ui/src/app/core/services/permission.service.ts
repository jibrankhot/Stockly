import { Injectable } from '@angular/core';

import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
    private readonly authService: AuthService,
  ) { }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(
      (permission) => this.hasPermission(permission),
    );
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(
      (permission) => this.hasPermission(permission),
    );
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }
}