import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize =
  | 'small'
  | 'medium'
  | 'large';

export type ButtonType =
  | 'button'
  | 'submit'
  | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';

  @Input() size: ButtonSize = 'medium';

  @Input() type: ButtonType = 'button';

  @Input() disabled = false;

  @Input() loading = false;

  @Input() fullWidth = false;

  @Input() ariaLabel = '';

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get buttonClasses(): string[] {
    return [
      `button--${this.variant}`,
      `button--${this.size}`,
      this.fullWidth ? 'button--full-width' : '',
      this.loading ? 'button--loading' : '',
    ].filter(Boolean);
  }
}