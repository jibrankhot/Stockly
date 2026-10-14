import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type AppTheme = 'green' | 'blue';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storageKey = 'stockly-theme';
    private readonly defaultTheme: AppTheme = 'green';
    private readonly platformId = inject(PLATFORM_ID);
    private currentTheme: AppTheme = this.defaultTheme;

    constructor() {
        this.initializeTheme();
    }

    get theme(): AppTheme {
        return this.currentTheme;
    }

    setTheme(theme: AppTheme): void {
        if (theme !== 'green' && theme !== 'blue') {
            return;
        }

        this.currentTheme = theme;
        this.applyTheme(theme);

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            localStorage.setItem(this.storageKey, theme);
        } catch {
            // Theme still applies for the current session if storage is unavailable.
        }
    }

    toggleTheme(): void {
        this.setTheme(this.currentTheme === 'green' ? 'blue' : 'green');
    }

    private initializeTheme(): void {
        let savedTheme: string | null = null;

        if (isPlatformBrowser(this.platformId)) {
            try {
                savedTheme = localStorage.getItem(this.storageKey);
            } catch {
                // Fall back to the default theme if storage is unavailable.
            }
        }

        this.currentTheme =
            savedTheme === 'green' || savedTheme === 'blue'
                ? savedTheme
                : this.defaultTheme;

        this.applyTheme(this.currentTheme);
    }

    private applyTheme(theme: AppTheme): void {
        if (isPlatformBrowser(this.platformId)) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
}