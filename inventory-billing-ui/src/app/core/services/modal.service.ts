import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

export type ModalVariant = 'default' | 'danger' | 'warning' | 'success';

export interface ModalState {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly modalSubject = new BehaviorSubject<ModalState>({
    isOpen: false,
  });

  private resultSubject = new ReplaySubject<boolean>(1);

  readonly modal$ = this.modalSubject.asObservable();

  get state(): ModalState {
    return this.modalSubject.value;
  }

  getState(): ModalState {
    return this.modalSubject.value;
  }

  open(
    title?: string,
    message?: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant: ModalVariant = 'default',
  ): Observable<boolean> {
    if (this.modalSubject.value.isOpen) {
      this.finish(false);
    }

    this.resultSubject = new ReplaySubject<boolean>(1);

    this.modalSubject.next({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
    });

    return this.resultSubject.asObservable();
  }

  confirm(): void {
    if (this.modalSubject.value.isOpen) {
      this.finish(true);
    }
  }

  close(): void {
    if (this.modalSubject.value.isOpen) {
      this.finish(false);
    }
  }

  private finish(result: boolean): void {
    this.modalSubject.next({ isOpen: false });
    this.resultSubject.next(result);
    this.resultSubject.complete();
  }
}