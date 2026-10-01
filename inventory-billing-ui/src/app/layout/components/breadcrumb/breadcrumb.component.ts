import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
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

  breadcrumbs: readonly BreadcrumbItem[] = [];

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.buildBreadcrumbs(event.urlAfterRedirects);
      });

    this.buildBreadcrumbs(this.router.url);
  }

  private buildBreadcrumbs(url: string): void {
    const cleanUrl = url
      .split('?')[0]
      .split('#')[0];

    const segments = cleanUrl
      .split('/')
      .filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [];

    let currentUrl = '';

    for (const [index, segment] of segments.entries()) {
      currentUrl += `/${segment}`;

      // Auth is a routing/layout segment, not a user-facing breadcrumb.
      if (segment === 'auth') {
        continue;
      }

      breadcrumbs.push({
        label: this.formatLabel(segment),
        url: currentUrl,
        active: index === segments.length - 1,
      });
    }

    this.breadcrumbs = breadcrumbs;
  }

  private formatLabel(segment: string): string {
    let decodedSegment: string;

    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      decodedSegment = segment;
    }

    // Example:
    // /products/25 → Details
    if (/^\d+$/.test(decodedSegment)) {
      return 'Details';
    }

    return decodedSegment
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}