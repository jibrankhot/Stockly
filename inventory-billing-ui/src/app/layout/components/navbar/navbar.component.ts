import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { AppTheme, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [UserMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  @Output() readonly menuToggle = new EventEmitter<void>();
  @Output() readonly searchSubmitted = new EventEmitter<string>();
  @Output() readonly notificationsClicked = new EventEmitter<void>();

  searchQuery = '';
  notificationCount = 0;
  themeMenuOpen = false;

  constructor(readonly themeService: ThemeService) { }

  get currentTheme(): AppTheme {
    return this.themeService.theme;
  }

  toggleThemeMenu(): void {
    this.themeMenuOpen = !this.themeMenuOpen;
  }

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
    this.themeMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('.theme-picker')) {
      this.themeMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.themeMenuOpen = false;
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.searchSubmitted.emit(query);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  onNotificationsClick(): void {
    this.notificationsClicked.emit();
  }
}