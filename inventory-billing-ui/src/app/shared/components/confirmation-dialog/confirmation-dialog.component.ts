import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly modalService = inject(ModalService);

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.modalService.getState().isOpen) {
      this.cancel();
    }
  }

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