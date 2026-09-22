import { Component, HostListener, inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet
} from '@angular/router';

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

  private readonly router = inject(Router);

  isSidebarOpen = true;
  isNavigating = false;

  private readonly mobileBreakpoint = 767;

  private readonly minimumLoaderDuration = 300;

  private navigationStartTime = 0;

  constructor() {
    this.initializeSidebarState();
    this.listenToRouterNavigation();
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

  private listenToRouterNavigation(): void {
    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {
        this.navigationStartTime = Date.now();

        this.isNavigating = true;

        this.closeSidebarOnMobile();

        return;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.finishNavigation();
      }

    });
  }

  private finishNavigation(): void {
    const elapsedTime =
      Date.now() - this.navigationStartTime;

    const remainingTime =
      this.minimumLoaderDuration - elapsedTime;

    if (remainingTime > 0) {

      setTimeout(() => {
        this.isNavigating = false;
      }, remainingTime);

      return;
    }

    this.isNavigating = false;
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