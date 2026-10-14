import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { filter } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  breadcrumbs: readonly BreadcrumbItem[] = [];

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateBreadcrumbs());

    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    const items: BreadcrumbItem[] = [];
    let currentUrl = '';
    const routes = this.getPrimaryRoutes(this.router.routerState.snapshot.root);

    for (const route of routes) {
      const configuredLabel = route.data['breadcrumb'];
      const routeSegments = route.url;

      for (const segment of routeSegments) {
        currentUrl += `/${segment.path}`;
      }

      if (configuredLabel === false) {
        continue;
      }

      if (routeSegments.length > 0) {
        const path = routeSegments.map((segment) => segment.path).join('/');
        const label =
          typeof configuredLabel === 'string'
            ? configuredLabel
            : this.formatLabel(path);

        if (label.trim() && path.toLowerCase() !== 'auth') {
          items.push({
            label,
            url: currentUrl || '/',
            active: false,
          });
        }
      } else if (
        typeof configuredLabel === 'string' &&
        configuredLabel.trim() &&
        configuredLabel !== 'Home' &&
        configuredLabel !== items.at(-1)?.label
      ) {
        items.push({
          label: configuredLabel,
          url: currentUrl || '/',
          active: false,
        });
      }
    }

    if (items.length > 0) {
      items[items.length - 1] = {
        ...items[items.length - 1],
        active: true,
      };
    }

    this.breadcrumbs = items;
    this.cdr.markForCheck();
  }

  private getPrimaryRoutes(root: ActivatedRouteSnapshot): ActivatedRouteSnapshot[] {
    const routes: ActivatedRouteSnapshot[] = [];
    let current: ActivatedRouteSnapshot | undefined = root;

    while (current) {
      routes.push(current);
      current = current.children.find((child) => child.outlet === 'primary');
    }

    return routes;
  }

  private formatLabel(path: string): string {
    let decoded: string;

    try {
      decoded = decodeURIComponent(path);
    } catch {
      decoded = path;
    }

    if (/^\d+$/.test(decoded)) {
      return 'Details';
    }

    return decoded
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}