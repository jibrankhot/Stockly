import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  SidebarItem,
  SIDEBAR_ITEMS
} from './sidebar-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input()
  isOpen = true;

  expandedMenus = new Set<string>();

  readonly sidebarItems: SidebarItem[] = SIDEBAR_ITEMS;

  toggleMenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }

  hasChildren(item: SidebarItem): boolean {
    return !!item.children?.length;
  }
}