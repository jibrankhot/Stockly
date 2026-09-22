import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthUser } from '../../../core/auth/models/auth-user';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss'
})
export class UserMenuComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isMenuOpen = false;

  get currentUser(): AuthUser | null {
    return this.authService.getCurrentUser();
  }

  get displayName(): string {
    const user = this.currentUser;

    if (!user) {
      return 'User';
    }

    return user.fullName || user.username;
  }

  get initials(): string {
    const user = this.currentUser;

    if (!user) {
      return 'U';
    }

    const firstInitial = user.firstName?.charAt(0) ?? '';
    const lastInitial = user.lastName?.charAt(0) ?? '';

    const initials = `${firstInitial}${lastInitial}`.trim();

    return initials || user.username.charAt(0).toUpperCase();
  }

  get roleName(): string {
    return this.currentUser?.roles?.[0] || 'User';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goToProfile(): void {
    this.closeMenu();

    this.router.navigate(['/settings/company']);
  }

  logout(): void {
    this.closeMenu();

    this.authService.logout();

    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMenu();
  }
}