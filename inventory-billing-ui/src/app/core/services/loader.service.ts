import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private activeRequests = 0;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  show(): void {
    this.activeRequests++;
    this.updateLoadingState();
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.updateLoadingState();
  }

  reset(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }

  private updateLoadingState(): void {
    this.loadingSubject.next(this.activeRequests > 0);
  }
}