import { Component, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink
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
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  private readonly router = inject(Router);

  breadcrumbs: BreadcrumbItem[] = [];

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
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
      .filter(segment => segment.length > 0);

    const breadcrumbs: BreadcrumbItem[] = [];

    let currentUrl = '';

    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;

      breadcrumbs.push({
        label: this.formatLabel(segment),
        url: currentUrl,
        active: index === segments.length - 1
      });
    });

    this.breadcrumbs = breadcrumbs;
  }

  private formatLabel(segment: string): string {
    const decodedSegment = decodeURIComponent(segment);

    // Dynamic route ID
    // Example: /products/25 → Details
    if (/^\d+$/.test(decodedSegment)) {
      return 'Details';
    }

    return decodedSegment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());
  }
}