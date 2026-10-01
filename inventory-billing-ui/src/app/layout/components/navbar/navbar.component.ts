import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [UserMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  @Output()
  readonly menuToggle = new EventEmitter<void>();

  @Output()
  readonly searchSubmitted = new EventEmitter<string>();

  @Output()
  readonly notificationsClicked = new EventEmitter<void>();

  searchQuery = '';

  /*
   * This will eventually come from the application's
   * notification source/service.
   */
  notificationCount = 0;

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
  }

  onSearch(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      return;
    }

    this.searchSubmitted.emit(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  onNotificationsClick(): void {
    this.notificationsClicked.emit();
  }
}