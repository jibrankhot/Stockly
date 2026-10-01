import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

export type ModalSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'fullscreen';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  @Input() title = '';
  @Input() size: ModalSize = 'medium';
  @Input() open = false;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() showCloseButton = true;

  @Output() readonly closeRequested =
    new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open && this.closeOnEscape) {
      this.close();
    }
  }

  close(): void {
    this.closeRequested.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      this.closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      this.close();
    }
  }
}