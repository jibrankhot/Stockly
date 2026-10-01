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

import {
  SIDEBAR_ITEMS,
  SidebarItem,
} from './sidebar-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input()
  isOpen = true;

  private readonly expandedMenus = new Set<string>();

  readonly sidebarItems: readonly SidebarItem[] = SIDEBAR_ITEMS;

  constructor() {
    this.expandParentForCurrentRoute(this.router.url);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.expandParentForCurrentRoute(event.urlAfterRedirects);
        this.changeDetectorRef.markForCheck();
      });
  }

  toggleMenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
      return;
    }

    this.expandedMenus.add(label);
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }

  hasChildren(item: SidebarItem): boolean {
    return !!item.children?.length;
  }

  private expandParentForCurrentRoute(url: string): void {
    const cleanUrl = url
      .split('?')[0]
      .split('#')[0];

    for (const item of this.sidebarItems) {
      if (!item.children?.length) {
        continue;
      }

      const hasActiveChild = item.children.some(
        (child) =>
          !!child.route &&
          this.isRouteMatch(cleanUrl, child.route),
      );

      if (hasActiveChild) {
        this.expandedMenus.add(item.label);
      }
    }
  }

  private isRouteMatch(
    currentUrl: string,
    route: string,
  ): boolean {
    return (
      currentUrl === route ||
      currentUrl.startsWith(`${route}/`)
    );
  }
}