
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

export type ModalVariant = 'default' | 'danger';

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: ModalVariant;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private readonly defaultState: ModalState = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default'
  };

  private readonly modalSubject =
    new BehaviorSubject<ModalState>(this.defaultState);

  readonly modal$ = this.modalSubject.asObservable();

  private resultSubject: ReplaySubject<boolean> | null = null;

  open(
    title: string,
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant: ModalVariant = 'default'
  ): Observable<boolean> {
    // Cancel any previously open dialog.
    if (this.resultSubject) {
      this.finish(false);
    }

    this.resultSubject = new ReplaySubject<boolean>(1);

    this.modalSubject.next({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant
    });

    return this.resultSubject.asObservable();
  }

  confirm(): void {
    this.finish(true);
  }

  close(): void {
    this.finish(false);
  }

  getState(): ModalState {
    return this.modalSubject.value;
  }

  private finish(result: boolean): void {
    const subject = this.resultSubject;

    if (!subject) {
      this.modalSubject.next({ ...this.defaultState });
      return;
    }

    this.resultSubject = null;
    this.modalSubject.next({ ...this.defaultState });

    subject.next(result);
    subject.complete();
  }
}