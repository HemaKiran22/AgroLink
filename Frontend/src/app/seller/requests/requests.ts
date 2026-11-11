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
  RequestStatus,
  SellerProductRequest
} from '../../models/product-request';

@Component({
  selector: 'app-seller-requests',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
})
export class SellerRequests implements OnInit {

  private productRequestService = inject(ProductRequestService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State (signals refresh the UI automatically) ----------
  requests = signal<SellerProductRequest[]>([]);
  loading = signal(false);
  updatingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  // ---------- Filters ----------
  selectedStatus = signal<'All' | RequestStatus>('All');
  searchText = signal('');

  // Recalculates automatically when requests, search or status change
  filteredRequests = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.requests().filter(request => {
      const matchesStatus =
        status === 'All' || request.status === status;

      const matchesSearch =
        !search ||
        (request.farmerName ?? '').toLowerCase().includes(search) ||
        (request.agrochemicalName ?? '').toLowerCase().includes(search) ||
        (request.message ?? '').toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
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
      .getSellerRequests()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (requests) => {
          this.requests.set(requests);
        },
        error: (error) => {
          console.error('Load seller requests failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load farmer requests.'
          );
        }
      });
  }


  // ---------- Update status ----------
  updateStatus(request: SellerProductRequest, status: RequestStatus): void {
    if (request.status === status) {
      return;
    }

    const confirmationMessage =
      status === 'Rejected'
        ? `Reject the request from ${request.farmerName}?`
        : `Change this request to ${status}?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    this.updatingId.set(request.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.productRequestService
      .updateStatus(request.id, { status })
      .pipe(
        finalize(() => this.updatingId.set(null))
      )
      .subscribe({
        next: () => {
          // Replace the request with a new object so signals detect the change
          this.requests.update(list =>
            list.map(item =>
              item.id === request.id ? { ...item, status } : item
            )
          );
          this.successMessage.set(`Request status changed to ${status}.`);
        },
        error: (error) => {
          console.error('Update request failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to update request status.'
          );
        }
      });
  }
}