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
  selector: 'app-number-input',
  standalone: true,
  imports: [],
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(
        () => NumberInputComponent,
      ),
      multi: true,
    },
  ],
})
export class NumberInputComponent
  implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() id = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() required = false;
  @Input() readonly = false;

  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step = 1;

  @Input() showStepper = true;

  @Input() decimalPlaces: number | null = null;

  value: number | null = null;
  disabled = false;

  private onChange: (value: number | null) => void =
    () => { };

  private onTouched: () => void = () => { };

  get inputId(): string {
    return this.id || this.name || 'stockly-number-input';
  }

  get hasPrefix(): boolean {
    return !!this.prefix;
  }

  get hasSuffix(): boolean {
    return !!this.suffix;
  }

  writeValue(value: number | null): void {
    this.value = this.normalizeValue(value);
  }

  registerOnChange(
    fn: (value: number | null) => void,
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
    if (value === '') {
      this.value = null;
      this.onChange(null);
      return;
    }

    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    const normalizedValue =
      this.normalizeValue(parsedValue);

    this.value = normalizedValue;
    this.onChange(normalizedValue);
  }

  increment(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    const currentValue = this.value ?? 0;
    const nextValue =
      currentValue + this.step;

    if (
      this.max !== null &&
      nextValue > this.max
    ) {
      return;
    }

    this.updateValue(nextValue);
  }

  decrement(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    const currentValue = this.value ?? 0;
    const nextValue =
      currentValue - this.step;

    if (
      this.min !== null &&
      nextValue < this.min
    ) {
      return;
    }

    this.updateValue(nextValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  private updateValue(value: number): void {
    const normalizedValue =
      this.normalizeValue(value);

    this.value = normalizedValue;
    this.onChange(normalizedValue);
  }

  private normalizeValue(
    value: number | null,
  ): number | null {
    if (value === null || Number.isNaN(value)) {
      return null;
    }

    let normalizedValue = value;

    if (this.min !== null) {
      normalizedValue = Math.max(
        normalizedValue,
        this.min,
      );
    }

    if (this.max !== null) {
      normalizedValue = Math.min(
        normalizedValue,
        this.max,
      );
    }

    if (this.decimalPlaces !== null) {
      const multiplier =
        10 ** this.decimalPlaces;

      normalizedValue =
        Math.round(
          normalizedValue * multiplier,
        ) / multiplier;
    }

    return normalizedValue;
  }
}