import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { AgrochemicalService } from '../../services/agrochemical';
import { ProductRequestService } from '../../services/product-request';
import { CropService } from '../../services/crop';

import { User } from '../../models/user';
import { Agrochemical } from '../../models/agrochemical';
import { Crop } from '../../models/crop';
import {
  RequestStatus,
  SellerProductRequest
} from '../../models/product-request';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class SellerDashboard implements OnInit {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private agrochemicalService = inject(AgrochemicalService);
  private productRequestService = inject(ProductRequestService);
  private cropService = inject(CropService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Products at or below this stock level show in Low Stock Alerts
  readonly lowStockLimit = 5;

  // ---------- State ----------
  user = signal<User | null>(null);
  products = signal<Agrochemical[]>([]);
  requests = signal<SellerProductRequest[]>([]);
  crops = signal<Crop[]>([]);
  loading = signal(false);
  loadError = signal(false);
  menuOpen = signal(false);
  updatingId = signal<number | null>(null);

  today = new Date();

  // ---------- Greeting ----------
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  firstName = computed(() =>
    (this.user()?.name ?? 'Seller').split(' ')[0]
  );

  // ---------- Product stats ----------
  totalProducts = computed(() => this.products().length);

  totalStock = computed(() =>
    this.products().reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0)
  );

  inventoryValue = computed(() =>
    this.products().reduce(
      (sum, p) => sum + (p.stockQuantity ?? 0) * (p.price ?? 0),
      0
    )
  );

  outOfStockCount = computed(() =>
    this.products().filter(p => p.stockQuantity <= 0).length
  );

  lowStockProducts = computed(() =>
    this.products()
      .filter(p => p.stockQuantity <= this.lowStockLimit)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 5)
  );

  recentProducts = computed(() => this.products().slice(0, 4));

  // ---------- Request stats ----------
  totalRequests = computed(() => this.requests().length);

  pendingCount = computed(() => this.countByStatus('Pending'));
  approvedCount = computed(() => this.countByStatus('Approved'));
  rejectedCount = computed(() => this.countByStatus('Rejected'));
  completedCount = computed(() => this.countByStatus('Completed'));

  statusBreakdown = computed(() => {
    const total = this.totalRequests() || 1;

    return [
      { label: 'Pending', count: this.pendingCount(), css: 'pending' },
      { label: 'Approved', count: this.approvedCount(), css: 'approved' },
      { label: 'Rejected', count: this.rejectedCount(), css: 'rejected' },
      { label: 'Completed', count: this.completedCount(), css: 'completed' }
    ].map(item => ({
      ...item,
      percent: Math.round((item.count / total) * 100)
    }));
  });

  // Oldest pending first, because they have waited the longest
  pendingRequests = computed(() =>
    this.requests()
      .filter(r => r.status === 'Pending')
      .sort((a, b) =>
        new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
      )
      .slice(0, 5)
  );

  // ---------- Crops ----------
  recentCrops = computed(() => this.crops().slice(0, 4));


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.user.set(this.authService.getStoredUser());
      this.loadDashboard();
    }
  }


  // ---------- Load everything in parallel ----------
  loadDashboard(): void {
    this.loading.set(true);
    this.loadError.set(false);

    forkJoin({
      products: this.agrochemicalService.getMyProducts().pipe(
        catchError(error => this.handleError('products', error))
      ),
      requests: this.productRequestService.getSellerRequests().pipe(
        catchError(error => this.handleError('requests', error))
      ),
      crops: this.cropService.getAllCrops().pipe(
        catchError(error => this.handleError('crops', error))
      )
    })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe(({ products, requests, crops }) => {
        this.products.set(products as Agrochemical[]);
        this.requests.set(requests as SellerProductRequest[]);
        this.crops.set(crops as Crop[]);

        if (this.loadError()) {
          this.toastService.error('Some dashboard data could not be loaded.');
        }
      });
  }


  refresh(): void {
    this.loadDashboard();
    this.toastService.show('Dashboard refreshed.', 'info', 2500);
  }


  // ---------- Approve / Reject from the dashboard ----------
  updateStatus(request: SellerProductRequest, status: RequestStatus): void {
    const confirmMessage =
      status === 'Approved'
        ? `Approve ${request.quantity} unit(s) of "${request.agrochemicalName}" for ${request.farmerName}?`
        : `Reject the request from ${request.farmerName}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.updatingId.set(request.id);

    this.productRequestService
      .updateStatus(request.id, { status })
      .pipe(
        finalize(() => this.updatingId.set(null))
      )
      .subscribe({
        next: (res: any) => {
          // Update the request in the list (new object so signals notice)
          this.requests.update(list =>
            list.map(item =>
              item.id === request.id ? { ...item, status } : item
            )
          );

          // Reflect the reduced stock immediately
          if (status === 'Approved' && res?.remainingStock !== undefined) {
            this.products.update(list =>
              list.map(product =>
                product.id === request.agrochemicalId
                  ? { ...product, stockQuantity: res.remainingStock }
                  : product
              )
            );
          }

          this.toastService.success(
            status === 'Approved'
              ? `Request approved. Remaining stock: ${res?.remainingStock ?? '-'}.`
              : 'Request rejected.'
          );
        },
        error: (error) => {
          console.error('Update request failed:', error);
          this.toastService.error(
            error.error?.message ?? 'Unable to update request status.'
          );
        }
      });
  }


  // ---------- Navigation ----------
  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  addProduct(): void {
    this.router.navigate(['/seller/agrochemicals'], { queryParams: { action: 'add' } });
  }

  logout(): void {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }

    this.authService.logout();
    this.toastService.success('You have been logged out successfully.');
    this.router.navigateByUrl('/');
  }


  // ---------- Helpers ----------
  getStatusClass(status: string): string {
    return (status ?? '').toLowerCase();
  }

  private countByStatus(status: string): number {
    return this.requests().filter(r => r.status === status).length;
  }

  private handleError(source: string, error: unknown) {
    console.error(`Load ${source} failed:`, error);
    this.loadError.set(true);
    return of([]);
  }
}