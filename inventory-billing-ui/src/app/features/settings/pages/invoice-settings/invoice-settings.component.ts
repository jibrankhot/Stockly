
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-invoice-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './invoice-settings.component.html',
  styleUrl: './invoice-settings.component.scss'
})
export class InvoiceSettingsComponent {

  invoiceForm: FormGroup;
  saving = false;
  saved = false;

  constructor(
    private fb: FormBuilder
  ) {
    this.invoiceForm = this.fb.group({

      invoicePrefix: [
        'INV',
        Validators.required
      ],

      nextInvoiceNumber: [
        1004,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      paymentTerms: [
        30,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      defaultNotes: [
        'Thank you for your business.'
      ],

      showCompanyDetails: [
        true
      ],

      showTaxDetails: [
        true
      ],

      showPaymentDetails: [
        true
      ]

    });
  }

  save(): void {

    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.saved = false;
      return;
    }

    this.saving = true;
    this.saved = false;

    // Simulated save — replace with a backend service
    // when invoice settings persistence is implemented.
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
    }, 500);
  }

}
