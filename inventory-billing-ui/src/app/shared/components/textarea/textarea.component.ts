import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() id = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() rows = 4;
  @Input() maxLength: number | null = null;
  @Input() minLength: number | null = null;
  @Input() resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  get textareaId(): string {
    return this.id || this.name || 'stockly-textarea';
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}