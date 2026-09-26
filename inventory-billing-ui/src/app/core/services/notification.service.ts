import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationMessage {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private nextId = 1;

  private readonly notificationSubject =
    new BehaviorSubject<NotificationMessage[]>([]);

  readonly notifications$ =
    this.notificationSubject.asObservable();

  success(message: string, duration = 10000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 10000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration = 10000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 10000): void {
    this.show('info', message, duration);
  }

  remove(id: number): void {
    const notifications = this.notificationSubject.value.filter(
      notification => notification.id !== id
    );

    this.notificationSubject.next(notifications);
  }

  clear(): void {
    this.notificationSubject.next([]);
  }

  private show(
    type: NotificationType,
    message: string,
    duration: number
  ): void {
    const notification: NotificationMessage = {
      id: this.nextId++,
      type,
      message,
      duration
    };

    this.notificationSubject.next([
      ...this.notificationSubject.value,
      notification
    ]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }
}