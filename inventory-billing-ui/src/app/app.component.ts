import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NotificationToastComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent { }