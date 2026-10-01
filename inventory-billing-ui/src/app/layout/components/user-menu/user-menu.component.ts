import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthUser } from '../../../core/auth/models/auth-user';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

    return user.fullName?.trim() || user.username;
  }

  get initials(): string {
    const user = this.currentUser;

    if (!user) {
      return 'U';
    }

    const firstInitial = user.firstName?.trim().charAt(0) ?? '';
    const lastInitial = user.lastName?.trim().charAt(0) ?? '';

    const initials = `${firstInitial}${lastInitial}`.toUpperCase();

    if (initials) {
      return initials;
    }

    return user.username.trim().charAt(0).toUpperCase() || 'U';
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

    void this.router.navigate(['/settings/company']);
  }

  logout(): void {
    this.closeMenu();

    this.authService.logout();

    void this.router.navigate(['/auth/login']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMenu();
  }
}