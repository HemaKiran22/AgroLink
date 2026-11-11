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
import { CropService } from '../../services/crop';
import { AgrochemicalService } from '../../services/agrochemical';
import { ProductRequestService } from '../../services/product-request';

import { User } from '../../models/user';
import { Crop } from '../../models/crop';
import { Agrochemical } from '../../models/agrochemical';
import { FarmerProductRequest } from '../../models/product-request';

@Component({
  selector: 'app-farmer-dashboard',
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
export class FarmerDashboard implements OnInit {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private cropService = inject(CropService);
  private agrochemicalService = inject(AgrochemicalService);
  private productRequestService = inject(ProductRequestService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // ---------- State ----------
  user = signal<User | null>(null);
  crops = signal<Crop[]>([]);
  products = signal<Agrochemical[]>([]);
  requests = signal<FarmerProductRequest[]>([]);
  loading = signal(false);
  loadError = signal(false);
  menuOpen = signal(false);

  today = new Date();

  // ---------- Greeting ----------
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  firstName = computed(() =>
    (this.user()?.name ?? 'Farmer').split(' ')[0]
  );

  // ---------- Crop stats ----------
  totalCrops = computed(() => this.crops().length);

  totalStockKg = computed(() =>
    this.crops().reduce((sum, crop) => sum + (crop.quantityInKg ?? 0), 0)
  );

  listingValue = computed(() =>
    this.crops().reduce(
      (sum, crop) => sum + (crop.quantityInKg ?? 0) * (crop.pricePerKg ?? 0),
      0
    )
  );

  recentCrops = computed(() => this.crops().slice(0, 4));

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

  recentRequests = computed(() =>
    [...this.requests()]
      .sort((a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      )
      .slice(0, 5)
  );

  // ---------- Product stats ----------
  availableProducts = computed(() =>
    this.products().filter(product => product.stockQuantity > 0)
  );

  featuredProducts = computed(() => this.availableProducts().slice(0, 4));


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
      crops: this.cropService.getMyCrops().pipe(
        catchError(error => this.handleError('crops', error))
      ),
      products: this.agrochemicalService.getAllProducts().pipe(
        catchError(error => this.handleError('products', error))
      ),
      requests: this.productRequestService.getFarmerRequests().pipe(
        catchError(error => this.handleError('requests', error))
      )
    })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe(({ crops, products, requests }) => {
        this.crops.set(crops as Crop[]);
        this.products.set(products as Agrochemical[]);
        this.requests.set(requests as FarmerProductRequest[]);

        if (this.loadError()) {
          this.toastService.error('Some dashboard data could not be loaded.');
        }
      });
  }


  refresh(): void {
    this.loadDashboard();
    this.toastService.show('Dashboard refreshed.', 'info', 2500);
  }


  // ---------- Navigation ----------
  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  addCrop(): void {
    this.router.navigate(['/farmer/crops'], { queryParams: { action: 'add' } });
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
    return this.requests().filter(request => request.status === status).length;
  }

  private handleError(source: string, error: unknown) {
    console.error(`Load ${source} failed:`, error);
    this.loadError.set(true);
    return of([]);
  }
}