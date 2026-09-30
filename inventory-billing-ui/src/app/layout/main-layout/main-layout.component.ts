import {
  Component,
  DestroyRef,
  HostListener,
  inject,
} from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    BreadcrumbComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // ---------------------------------------------------------------------------
  // Sidebar state
  // ---------------------------------------------------------------------------

  isSidebarOpen = true;

  private desktopSidebarState = true;

  // ---------------------------------------------------------------------------
  // Navigation state
  // ---------------------------------------------------------------------------

  isNavigating = false;

  private readonly minimumLoaderDuration = 300;
  private navigationStartTime = 0;
  private navigationTimer: ReturnType<typeof setTimeout> | null = null;

  // ---------------------------------------------------------------------------
  // Responsive state
  // ---------------------------------------------------------------------------

  private readonly mobileBreakpoint = 767;

  // ---------------------------------------------------------------------------
  // Mobile scroll lock state
  // ---------------------------------------------------------------------------

  private bodyScrollLocked = false;
  private bodyScrollPosition = 0;

  private previousBodyStyles = {
    position: '',
    top: '',
    left: '',
    right: '',
    width: '',
    overflow: '',
  };

  private previousDocumentOverflow = '';

  constructor() {
    this.initializeSidebarState();
    this.listenToRouterNavigation();

    this.destroyRef.onDestroy(() => {
      this.clearNavigationTimer();
      this.unlockBodyScroll();
    });
  }

  // ---------------------------------------------------------------------------
  // Window resize
  // ---------------------------------------------------------------------------

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = false;
      this.unlockBodyScroll();
      return;
    }

    this.isSidebarOpen = this.desktopSidebarState;
    this.unlockBodyScroll();
  }

  // ---------------------------------------------------------------------------
  // Escape key
  // ---------------------------------------------------------------------------

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileViewport()) {
      this.closeSidebarOnMobile();
    }
  }

  // ---------------------------------------------------------------------------
  // Sidebar toggle
  // ---------------------------------------------------------------------------

  toggleSidebar(): void {
    const nextState = !this.isSidebarOpen;

    if (!this.isMobileViewport()) {
      this.isSidebarOpen = nextState;
      this.desktopSidebarState = nextState;
      this.unlockBodyScroll();
      return;
    }

    this.isSidebarOpen = nextState;

    if (nextState) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
  }

  // ---------------------------------------------------------------------------
  // Close mobile sidebar
  // ---------------------------------------------------------------------------

  closeSidebarOnMobile(): void {
    if (!this.isMobileViewport()) {
      return;
    }

    this.isSidebarOpen = false;
    this.unlockBodyScroll();
  }

  // ---------------------------------------------------------------------------
  // Router navigation
  // ---------------------------------------------------------------------------

  private listenToRouterNavigation(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.clearNavigationTimer();

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

  // ---------------------------------------------------------------------------
  // Finish navigation
  // ---------------------------------------------------------------------------

  private finishNavigation(): void {
    const elapsedTime = Date.now() - this.navigationStartTime;

    const remainingTime = Math.max(
      0,
      this.minimumLoaderDuration - elapsedTime,
    );

    if (remainingTime > 0) {
      this.navigationTimer = setTimeout(() => {
        this.isNavigating = false;
        this.navigationTimer = null;
      }, remainingTime);

      return;
    }

    this.isNavigating = false;
  }

  // ---------------------------------------------------------------------------
  // Clear pending navigation timer
  // ---------------------------------------------------------------------------

  private clearNavigationTimer(): void {
    if (this.navigationTimer === null) {
      return;
    }

    clearTimeout(this.navigationTimer);
    this.navigationTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Initial sidebar state
  // ---------------------------------------------------------------------------

  private initializeSidebarState(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = false;
      return;
    }

    this.isSidebarOpen = true;
    this.desktopSidebarState = true;
  }

  // ---------------------------------------------------------------------------
  // Mobile viewport check
  // ---------------------------------------------------------------------------

  private isMobileViewport(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.innerWidth <= this.mobileBreakpoint
    );
  }

  // ---------------------------------------------------------------------------
  // Lock page scroll while mobile drawer is open
  // ---------------------------------------------------------------------------

  private lockBodyScroll(): void {
    if (
      this.bodyScrollLocked ||
      !this.isMobileViewport() ||
      typeof window === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return;
    }

    this.bodyScrollPosition = window.scrollY;

    const body = document.body;
    const documentElement = document.documentElement;

    this.previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    this.previousDocumentOverflow = documentElement.style.overflow;

    body.style.position = 'fixed';
    body.style.top = `-${this.bodyScrollPosition}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    documentElement.style.overflow = 'hidden';

    this.bodyScrollLocked = true;
  }

  // ---------------------------------------------------------------------------
  // Restore page scroll after mobile drawer closes
  // ---------------------------------------------------------------------------

  private unlockBodyScroll(): void {
    if (
      !this.bodyScrollLocked ||
      typeof window === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return;
    }

    const body = document.body;
    const documentElement = document.documentElement;

    body.style.position = this.previousBodyStyles.position;
    body.style.top = this.previousBodyStyles.top;
    body.style.left = this.previousBodyStyles.left;
    body.style.right = this.previousBodyStyles.right;
    body.style.width = this.previousBodyStyles.width;
    body.style.overflow = this.previousBodyStyles.overflow;

    documentElement.style.overflow = this.previousDocumentOverflow;

    const scrollPosition = this.bodyScrollPosition;

    this.bodyScrollLocked = false;
    this.bodyScrollPosition = 0;

    window.scrollTo(0, scrollPosition);
  }
}