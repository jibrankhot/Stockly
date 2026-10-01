import {
    ChangeDetectionStrategy,
    Component,
    inject,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-notification-toast',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './notification-toast.component.html',
    styleUrl: './notification-toast.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationToastComponent {
    readonly notificationService = inject(
        NotificationService,
    );

    dismiss(id: number): void {
        this.notificationService.remove(id);
    }
}