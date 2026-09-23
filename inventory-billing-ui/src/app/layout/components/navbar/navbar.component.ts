import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    FormsModule,
    UserMenuComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  @Output()
  readonly menuToggle = new EventEmitter<void>();

  searchQuery = '';

  readonly notificationCount = 3;

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearch(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      return;
    }

    console.log('Global search:', query);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}