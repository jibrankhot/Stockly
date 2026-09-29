import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier-details',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule
  ],
  templateUrl: './supplier-details.component.html',
  styleUrl: './supplier-details.component.scss'
})
export class SupplierDetailsComponent implements OnInit {

  supplier: Supplier | null = null;

  isLoading = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly supplierService: SupplierService
  ) { }

  ngOnInit(): void {
    this.loadSupplier();
  }

  loadSupplier(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.router.navigate(['/suppliers']);
      return;
    }

    this.isLoading = true;

    this.supplierService
      .getSupplierById(id)
      .subscribe({
        next: supplier => {
          this.supplier = supplier;
          this.isLoading = false;

          if (!supplier) {
            this.router.navigate(['/suppliers']);
          }
        },

        error: error => {
          console.error(
            'Failed to load supplier:',
            error
          );

          this.isLoading = false;
          this.router.navigate(['/suppliers']);
        }
      });
  }

  editSupplier(): void {
    if (!this.supplier) {
      return;
    }

    this.router.navigate([
      '/suppliers',
      this.supplier.id,
      'edit'
    ]);
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }
}