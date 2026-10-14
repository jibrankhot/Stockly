import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  NgZone,
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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  isSidebarOpen = true;
  isNavigating = false;

  private desktopSidebarState = true;
  private readonly mobileBreakpoint = 767;
  private readonly minimumLoaderDuration = 300;
  private navigationStartTime = 0;
  private navigationTimer: ReturnType<typeof setTimeout> | null = null;
  private bodyScrollLocked = false;
  private previousBodyOverflow = '';
  private previousDocumentOverflow = '';

  constructor() {
    this.initializeSidebarState();
    this.listenToRouterNavigation();

    this.destroyRef.onDestroy(() => {
      this.clearNavigationTimer();
      this.unlockBodyScroll();
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = false;
      this.unlockBodyScroll();
    } else {
      this.isSidebarOpen = this.desktopSidebarState;
      this.unlockBodyScroll();
    }

    this.cdr.markForCheck();
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    this.closeSidebarOnMobile();
  }

  toggleSidebar(): void {
    if (!this.isMobileViewport()) {
      this.desktopSidebarState = !this.desktopSidebarState;
      this.isSidebarOpen = this.desktopSidebarState;
      this.cdr.markForCheck();
      return;
    }

    this.isSidebarOpen = !this.isSidebarOpen;

    if (this.isSidebarOpen) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }

    this.cdr.markForCheck();
  }

  closeSidebarOnMobile(): void {
    if (!this.isMobileViewport()) {
      return;
    }

    this.isSidebarOpen = false;
    this.unlockBodyScroll();
    this.cdr.markForCheck();
  }

  private listenToRouterNavigation(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.clearNavigationTimer();
          this.navigationStartTime = Date.now();
          this.isNavigating = true;
          this.cdr.markForCheck();
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
    const elapsed = Date.now() - this.navigationStartTime;
    const remaining = Math.max(
      0,
      this.minimumLoaderDuration - elapsed,
    );

    this.clearNavigationTimer();

    if (remaining === 0) {
      this.isNavigating = false;
      this.cdr.markForCheck();
      return;
    }

    this.navigationTimer = this.zone.runOutsideAngular(() =>
      setTimeout(() => {
        this.zone.run(() => {
          this.isNavigating = false;
          this.navigationTimer = null;
          this.cdr.markForCheck();
        });
      }, remaining),
    );
  }

  private clearNavigationTimer(): void {
    if (this.navigationTimer !== null) {
      clearTimeout(this.navigationTimer);
      this.navigationTimer = null;
    }
  }

  private initializeSidebarState(): void {
    this.isSidebarOpen = !this.isMobileViewport();
    this.desktopSidebarState = true;
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' &&
      window.innerWidth <= this.mobileBreakpoint;
  }

  private lockBodyScroll(): void {
    if (
      this.bodyScrollLocked ||
      !this.isMobileViewport() ||
      typeof document === 'undefined'
    ) {
      return;
    }

    const body = document.body;
    const documentElement = document.documentElement;

    this.previousBodyOverflow = body.style.overflow;
    this.previousDocumentOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    this.bodyScrollLocked = true;
  }

  private unlockBodyScroll(): void {
    if (!this.bodyScrollLocked || typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = this.previousBodyOverflow;
    document.documentElement.style.overflow =
      this.previousDocumentOverflow;

    this.bodyScrollLocked = false;
  }
}