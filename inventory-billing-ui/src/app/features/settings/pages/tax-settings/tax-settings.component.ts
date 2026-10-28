
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-tax-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './tax-settings.component.html',
  styleUrl: './tax-settings.component.scss'
})
export class TaxSettingsComponent {

  taxForm: FormGroup;
  saving = false;
  saved = false;

  taxRates = [
    { name: 'GST 0%', rate: 0 },
    { name: 'GST 5%', rate: 5 },
    { name: 'GST 12%', rate: 12 },
    { name: 'GST 18%', rate: 18 },
    { name: 'GST 28%', rate: 28 }
  ];

  constructor(
    private fb: FormBuilder
  ) {
    this.taxForm = this.fb.group({
      taxSystem: [
        'GST',
        Validators.required
      ],

      defaultTaxRate: [
        18,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]
      ],

      taxInclusive: [
        false
      ],

      enableTax: [
        true
      ]
    });
  }

  save(): void {
    if (this.taxForm.invalid) {
      this.taxForm.markAllAsTouched();
      this.saved = false;
      return;
    }

    this.saving = true;
    this.saved = false;

    // Simulated save. Connect to a settings service
    // when backend persistence is implemented.
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
    }, 500);
  }
}
