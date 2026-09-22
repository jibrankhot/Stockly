import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../components/navbar/navbar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    BreadcrumbComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  isSidebarOpen = true;

  private readonly mobileBreakpoint = 767;

  constructor() {
    this.initializeSidebarState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth <= this.mobileBreakpoint) {
      this.isSidebarOpen = false;
    }
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    this.closeSidebarOnMobile();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = false;
    }
  }

  private initializeSidebarState(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = false;
    }
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined'
      && window.innerWidth <= this.mobileBreakpoint;
  }
}