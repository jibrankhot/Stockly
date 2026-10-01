import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent {
  @Input() label = '';

  @Input() placeholder = 'Select date';

  @Input() value = '';

  @Input() min = '';

  @Input() max = '';

  @Input() disabled = false;

  @Input() required = false;

  @Input() readonly = false;

  @Input() name = '';

  @Input() id = '';

  @Input() errorMessage = '';

  @Input() hint = '';

  @Output() readonly valueChange =
    new EventEmitter<string>();

  @Output() readonly dateChange =
    new EventEmitter<string>();

  get inputId(): string {
    return (
      this.id ||
      this.name ||
      'stockly-date-picker'
    );
  }

  onDateChange(value: string): void {
    this.value = value;

    this.valueChange.emit(value);
    this.dateChange.emit(value);
  }
}