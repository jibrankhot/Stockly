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

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() id = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() autocomplete = 'off';
  @Input() maxLength: number | null = null;
  @Input() minLength: number | null = null;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number | null = null;

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  get inputId(): string {
    return this.id || this.name || 'stockly-input';
  }

  get hasPrefix(): boolean {
    return !!this.prefix;
  }

  get hasSuffix(): boolean {
    return !!this.suffix;
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(
    fn: (value: string) => void,
  ): void {
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