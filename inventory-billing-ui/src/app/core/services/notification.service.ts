import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface NotificationMessage {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private nextId = 1;

  private readonly defaultDuration = 8000;

  private readonly timers = new Map<
    number,
    ReturnType<typeof setTimeout>
  >();

  private readonly notificationSubject =
    new BehaviorSubject<NotificationMessage[]>([]);

  readonly notifications$ =
    this.notificationSubject.asObservable();

  success(
    message: string,
    duration = this.defaultDuration,
  ): void {
    this.show('success', message, duration);
  }

  error(
    message: string,
    duration = this.defaultDuration,
  ): void {
    this.show('error', message, duration);
  }

  warning(
    message: string,
    duration = this.defaultDuration,
  ): void {
    this.show('warning', message, duration);
  }

  info(
    message: string,
    duration = this.defaultDuration,
  ): void {
    this.show('info', message, duration);
  }

  remove(id: number): void {
    this.clearTimer(id);

    const notifications =
      this.notificationSubject.value.filter(
        (notification) => notification.id !== id,
      );

    this.notificationSubject.next(notifications);
  }

  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    this.notificationSubject.next([]);
  }

  private show(
    type: NotificationType,
    message: string,
    duration: number,
  ): void {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const notification: NotificationMessage = {
      id: this.nextId++,
      type,
      message: trimmedMessage,
      duration: Math.max(0, duration),
    };

    this.notificationSubject.next([
      ...this.notificationSubject.value,
      notification,
    ]);

    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);

      this.timers.set(notification.id, timer);
    }
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}