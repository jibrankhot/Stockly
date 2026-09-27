
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  readonly modalService = inject(ModalService);

  cancel(): void {
    this.modalService.close();
  }

  confirm(): void {
    this.modalService.confirm();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}