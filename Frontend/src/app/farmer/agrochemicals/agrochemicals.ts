import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AgrochemicalService } from '../../services/agrochemical';
import { ProductRequestService } from '../../services/product-request';
import { Agrochemical } from '../../models/agrochemical';
import { CreateProductRequest } from '../../models/product-request';

@Component({
  selector: 'app-agrochemicals',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './agrochemicals.html',
  styleUrl: './agrochemicals.css'
})
export class Agrochemicals implements OnInit {

  private agrochemicalService = inject(AgrochemicalService);
  private productRequestService = inject(ProductRequestService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State ----------
  products = signal<Agrochemical[]>([]);
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedProduct = signal<Agrochemical | null>(null);

  // ---------- Filters ----------
  searchText = signal('');
  selectedCategory = signal('All');

  // Unique, sorted category list for the dropdown
  categories = computed(() =>
    [
      ...new Set(
        this.products()
          .map(product => product.category)
          .filter(category => Boolean(category))
      )
    ].sort()
  );

  // Recalculates automatically when products, search or category change
  filteredProducts = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter(product => {
      const matchesSearch =
        !search ||
        (product.name ?? '').toLowerCase().includes(search) ||
        (product.category ?? '').toLowerCase().includes(search) ||
        (product.description ?? '').toLowerCase().includes(search) ||
        (product.sellerName ?? '').toLowerCase().includes(search);

      const matchesCategory =
        category === 'All' || product.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  // ---------- Request form (plain object because ngModel binds to it) ----------
  requestForm: CreateProductRequest = this.getEmptyRequest();


  ngOnInit(): void {
    // Load only in the browser (JWT token is in localStorage)
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }


  // ---------- Load ----------
  loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.agrochemicalService
      .getAllProducts()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
        },
        error: (error) => {
          console.error('Load agrochemicals failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load agrochemicals.'
          );
        }
      });
  }


  // ---------- Filters ----------
  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategory.set('All');
  }


  // ---------- Request form ----------
  openRequestForm(product: Agrochemical): void {
    if (product.stockQuantity <= 0) {
      this.errorMessage.set('This product is currently out of stock.');
      return;
    }

    this.selectedProduct.set(product);

    this.requestForm = {
      agrochemicalId: product.id,
      quantity: 1,
      message: ''
    };

    this.clearMessages();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeRequestForm(): void {
    this.selectedProduct.set(null);
    this.requestForm = this.getEmptyRequest();
  }

  submitRequest(form: NgForm): void {
    this.clearMessages();

    const product = this.selectedProduct();

    if (form.invalid || !product) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please enter a valid quantity.');
      return;
    }

    if (this.requestForm.quantity > product.stockQuantity) {
      this.errorMessage.set(
        `Only ${product.stockQuantity} items are available.`
      );
      return;
    }

    this.submitting.set(true);

    this.productRequestService
      .createRequest(this.requestForm)
      .pipe(
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Product request sent successfully.');
          this.closeRequestForm();
        },
        error: (error) => {
          console.error('Create request failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to send product request.'
          );
        }
      });
  }


  // ---------- Helpers ----------
  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private getEmptyRequest(): CreateProductRequest {
    return {
      agrochemicalId: 0,
      quantity: 1,
      message: ''
    };
  }
}