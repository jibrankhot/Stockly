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
import { SelectOption } from '../../../core/models/select-option';


@Component({
  selector: 'app-select',
  standalone: true,
  imports: [],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(
        () => SelectComponent,
      ),
      multi: true,
    },
  ],
})
export class SelectComponent
  implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() name = '';
  @Input() id = '';
  @Input() options: readonly SelectOption[] = [];
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() required = false;
  @Input() readonly = false;

  value: string | number | null = null;
  disabled = false;

  private onChange: (
    value: string | number | null,
  ) => void = () => { };

  private onTouched: () => void = () => { };

  get selectId(): string {
    return this.id || this.name || 'stockly-select';
  }

  writeValue(
    value: string | number | null,
  ): void {
    this.value = value;
  }

  registerOnChange(
    fn: (value: string | number | null) => void,
  ): void {
    this.onChange = fn;
  }

  registerOnTouched(
    fn: () => void,
  ): void {
    this.onTouched = fn;
  }

  setDisabledState(
    isDisabled: boolean,
  ): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(value: string): void {
    const selectedValue =
      this.getOptionValue(value);

    this.value = selectedValue;
    this.onChange(selectedValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  private getOptionValue(
    value: string,
  ): string | number | null {
    if (value === '') {
      return null;
    }

    const matchingOption =
      this.options.find(
        (option) =>
          String(option.value) === value,
      );

    return matchingOption?.value ?? value;
  }
}