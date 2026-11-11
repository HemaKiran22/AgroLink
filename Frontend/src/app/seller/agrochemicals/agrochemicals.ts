import {
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AgrochemicalService } from '../../services/agrochemical';
import {
  Agrochemical,
  AgrochemicalRequest
} from '../../models/agrochemical';

@Component({
  selector: 'app-seller-agrochemicals',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './agrochemicals.html',
  styleUrl: './agrochemicals.css'
})
export class SellerAgrochemicals implements OnInit {

  private agrochemicalService = inject(AgrochemicalService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State (signals refresh the UI automatically) ----------
  products = signal<Agrochemical[]>([]);
  loading = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  // Form model (plain object because ngModel binds to it)
  productForm: AgrochemicalRequest = this.getEmptyForm();


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
      .getMyProducts()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
        },
        error: (error) => {
          console.error('Load products failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load your products.'
          );
        }
      });
  }


  // ---------- Form open / close ----------
  openAddForm(): void {
    this.editingId.set(null);
    this.resetForm();
    this.showForm.set(true);
    this.clearMessages();
  }

  editProduct(product: Agrochemical): void {
    this.editingId.set(product.id);

    this.productForm = {
      name: product.name,
      category: product.category,
      description: product.description,
      usageInstructions: product.usageInstructions,
      price: product.price,
      stockQuantity: product.stockQuantity
    };

    this.showForm.set(true);
    this.clearMessages();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.resetForm();
  }


  // ---------- Save (Add / Update) ----------
  saveProduct(form: NgForm): void {
    this.clearMessages();

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please complete the product details correctly.');
      return;
    }

    this.saving.set(true);

    const id = this.editingId();

    const request$ = id !== null
      ? this.agrochemicalService.updateProduct(id, this.productForm)
      : this.agrochemicalService.createProduct(this.productForm);

    request$
      .pipe(
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            id !== null
              ? 'Agrochemical updated successfully.'
              : 'Agrochemical added successfully.'
          );
          this.showForm.set(false);
          this.editingId.set(null);
          this.resetForm();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Save product failed:', error);
          this.errorMessage.set(
            error.error?.message ??
            (id !== null ? 'Unable to update product.' : 'Unable to add product.')
          );
        }
      });
  }


  // ---------- Delete ----------
  deleteProduct(product: Agrochemical): void {
    if (!window.confirm(`Delete "${product.name}"?`)) {
      return;
    }

    this.clearMessages();
    this.deletingId.set(product.id);

    this.agrochemicalService
      .deleteProduct(product.id)
      .pipe(
        finalize(() => this.deletingId.set(null))
      )
      .subscribe({
        next: () => {
          // Remove from the list instantly, no reload needed
          this.products.update(list =>
            list.filter(item => item.id !== product.id)
          );
          this.successMessage.set('Agrochemical deleted successfully.');
        },
        error: (error) => {
          console.error('Delete product failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to delete product.'
          );
        }
      });
  }


  // ---------- Helpers ----------
  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private resetForm(): void {
    this.productForm = this.getEmptyForm();
  }

  private getEmptyForm(): AgrochemicalRequest {
    return {
      name: '',
      category: '',
      description: '',
      usageInstructions: '',
      price: 0,
      stockQuantity: 0
    };
  }
}