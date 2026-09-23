import {
  Component,
  HostListener,
  inject
} from '@angular/core';

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

  /* =======================================================
     SIDEBAR STATE
     ======================================================= */

  isSidebarOpen = true;

  /*
   * Desktop and mobile use different sidebar behaviour.
   *
   * Desktop:
   * - Open = full sidebar
   * - Closed = compact sidebar
   *
   * Mobile:
   * - Open = drawer
   * - Closed = hidden drawer
   */
  private desktopSidebarState = true;

  /* =======================================================
     NAVIGATION STATE
     ======================================================= */

  isNavigating = false;

  private readonly minimumLoaderDuration = 300;

  private navigationStartTime = 0;

  /* =======================================================
     BREAKPOINT
     ======================================================= */

  private readonly mobileBreakpoint = 767;

  /* =======================================================
     CONSTRUCTOR
     ======================================================= */

  constructor() {
    this.initializeSidebarState();
    this.listenToRouterNavigation();
  }

  /* =======================================================
     WINDOW RESIZE
     ======================================================= */

  @HostListener('window:resize')
  onWindowResize(): void {

    if (this.isMobileViewport()) {

      /*
       * Mobile always starts with the drawer closed.
       *
       * This prevents the desktop sidebar state from
       * becoming a full-screen mobile sidebar.
       */
      this.isSidebarOpen = false;

      return;
    }

    /*
     * When returning to desktop, restore the last
     * desktop sidebar state.
     */
    this.isSidebarOpen = this.desktopSidebarState;
  }

  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {

    if (this.isMobileViewport()) {
      this.closeSidebarOnMobile();
    }
  }

  /* =======================================================
     SIDEBAR TOGGLE
     ======================================================= */

  toggleSidebar(): void {

    this.isSidebarOpen = !this.isSidebarOpen;

    /*
     * Only remember the sidebar state on desktop.
     *
     * Mobile drawer state should never overwrite the
     * desktop collapsed/expanded preference.
     */
    if (!this.isMobileViewport()) {
      this.desktopSidebarState = this.isSidebarOpen;
    }
  }

  /* =======================================================
     CLOSE MOBILE SIDEBAR
     ======================================================= */

  closeSidebarOnMobile(): void {

    if (!this.isMobileViewport()) {
      return;
    }

    this.isSidebarOpen = false;
  }

  /* =======================================================
     ROUTER NAVIGATION
     ======================================================= */

  private listenToRouterNavigation(): void {

    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        this.navigationStartTime = Date.now();

        this.isNavigating = true;

        /*
         * Close the mobile drawer whenever the user
         * navigates to another route.
         */
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

  /* =======================================================
     FINISH NAVIGATION
     ======================================================= */

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

  /* =======================================================
     INITIAL SIDEBAR STATE
     ======================================================= */

  private initializeSidebarState(): void {

    if (this.isMobileViewport()) {

      this.isSidebarOpen = false;

      return;
    }

    this.isSidebarOpen = true;

    this.desktopSidebarState = true;
  }

  /* =======================================================
     MOBILE VIEWPORT CHECK
     ======================================================= */

  private isMobileViewport(): boolean {

    return typeof window !== 'undefined'
      && window.innerWidth <= this.mobileBreakpoint;
  }
}