
import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {

  product: Product | null = null;

  isLoading = false;
  hasLoadError = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const productId = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(productId) || productId <= 0) {
      this.hasLoadError = true;
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.hasLoadError = false;
    this.product = null;

    this.productService.getProductById(id).subscribe({
      next: product => {
        this.product = product;
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load product:', error);
        this.hasLoadError = true;
        this.isLoading = false;
      }
    });
  }

  editProduct(): void {
    if (!this.product) {
      return;
    }

    this.router.navigate([
      '/products',
      this.product.id,
      'edit'
    ]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  isLowStock(): boolean {
    if (!this.product) {
      return false;
    }

    return this.product.currentStock <= this.product.minimumStock;
  }

  getStockPercentage(): number {
    if (!this.product) {
      return 0;
    }

    if (this.product.minimumStock <= 0) {
      return this.product.currentStock > 0 ? 100 : 0;
    }

    const percentage =
      (this.product.currentStock /
        (this.product.minimumStock * 2)) * 100;

    return Math.min(
      Math.max(percentage, 0),
      100
    );
  }
}