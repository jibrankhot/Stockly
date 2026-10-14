import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  inject,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SIDEBAR_ITEMS, SidebarItem } from './sidebar-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly expandedMenus = new Set<string>();

  @Input() isOpen = true;

  readonly sidebarItems: readonly SidebarItem[] = SIDEBAR_ITEMS;

  constructor() {
    this.expandParentForCurrentRoute(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.expandParentForCurrentRoute(event.urlAfterRedirects);
        this.cdr.markForCheck();
      });
  }

  toggleMenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }

    this.cdr.markForCheck();
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }

  hasChildren(item: SidebarItem): boolean {
    return !!item.children?.length;
  }

  isItemActive(item: SidebarItem): boolean {
    if (item.route) {
      return this.isRouteMatch(this.router.url, item.route);
    }

    return !!item.children?.some(
      (child) => !!child.route && this.isRouteMatch(this.router.url, child.route),
    );
  }

  private expandParentForCurrentRoute(url: string): void {
    const currentUrl = this.normalizeUrl(url);

    for (const item of this.sidebarItems) {
      if (!item.children?.length) {
        continue;
      }

      const hasActiveChild = item.children.some(
        (child) => !!child.route && this.isRouteMatch(currentUrl, child.route),
      );

      if (hasActiveChild) {
        this.expandedMenus.add(item.label);
      }
    }
  }

  private isRouteMatch(currentUrl: string, route: string): boolean {
    const current = this.normalizeUrl(currentUrl);
    const target = this.normalizeUrl(route);

    return current === target || current.startsWith(`${target}/`);
  }

  private normalizeUrl(url: string): string {
    const path = url.split(/[?#]/)[0];
    const normalized = `/${path.split('/').filter(Boolean).join('/')}`;
    return normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/';
  }
}