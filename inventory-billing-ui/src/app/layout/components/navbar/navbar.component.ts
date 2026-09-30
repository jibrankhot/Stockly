import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    FormsModule,
    UserMenuComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Output()
  readonly menuToggle = new EventEmitter<void>();

  searchQuery = '';

  /**
   * Notification count will be connected to the
   * notification source/service when the navbar
   * notification functionality is implemented.
   */
  notificationCount = 0;

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearch(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      return;
    }

    // Global search functionality will be connected
    // to the appropriate feature/service.
    console.log('Global search:', query);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}