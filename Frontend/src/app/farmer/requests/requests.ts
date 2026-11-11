import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductRequestService } from '../../services/product-request';
import {
  FarmerProductRequest,
  RequestStatus
} from '../../models/product-request';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
})
export class Requests implements OnInit {

  private productRequestService = inject(ProductRequestService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State (signals refresh the UI automatically) ----------
  requests = signal<FarmerProductRequest[]>([]);
  loading = signal(false);
  deletingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  // ---------- Filter ----------
  selectedStatus = signal<'All' | RequestStatus>('All');

  // Recalculates automatically when requests or status change
  filteredRequests = computed(() => {
    const status = this.selectedStatus();

    return status === 'All'
      ? this.requests()
      : this.requests().filter(request => request.status === status);
  });


  ngOnInit(): void {
    // Load only in the browser (JWT token is in localStorage)
    if (isPlatformBrowser(this.platformId)) {
      this.loadRequests();
    }
  }


  // ---------- Load ----------
  loadRequests(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productRequestService
      .getFarmerRequests()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (requests) => {
          this.requests.set(requests);
        },
        error: (error) => {
          console.error('Load requests failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load your product requests.'
          );
        }
      });
  }


  // ---------- Delete ----------
  deleteRequest(request: FarmerProductRequest): void {
    if (request.status !== 'Pending') {
      this.errorMessage.set('Only Pending requests can be deleted.');
      return;
    }

    if (!window.confirm(`Delete your request for "${request.agrochemicalName}"?`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deletingId.set(request.id);

    this.productRequestService
      .deleteRequest(request.id)
      .pipe(
        finalize(() => this.deletingId.set(null))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Product request deleted successfully.');
          // Remove from the list instantly; filteredRequests updates by itself
          this.requests.update(list =>
            list.filter(item => item.id !== request.id)
          );
        },
        error: (error) => {
          console.error('Delete request failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to delete the request.'
          );
        }
      });
  }


  // ---------- Helpers ----------
  getTotalPrice(request: FarmerProductRequest): number {
    return request.productPrice * request.quantity;
  }
}