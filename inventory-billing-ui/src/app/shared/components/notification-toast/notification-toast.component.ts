
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-notification-toast',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './notification-toast.component.html',
    styleUrl: './notification-toast.component.scss'
})
export class NotificationToastComponent {
    readonly notificationService = inject(NotificationService);

    dismiss(id: number): void {
        this.notificationService.remove(id);
    }

    trackById(_index: number, notification: { id: number }): number {
        return notification.id;
    }
}