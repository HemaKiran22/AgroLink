import {
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CropService } from '../../services/crop';
import { Crop } from '../../models/crop';

@Component({
  selector: 'app-seller-crops',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './crops.html',
  styleUrl: './crops.css'
})
export class SellerCrops implements OnInit {

  private cropService = inject(CropService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State (signals refresh the UI automatically) ----------
  crops = signal<Crop[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  // ---------- Filters ----------
  searchText = signal('');
  selectedCategory = signal('All');

  // Unique, sorted category list for the dropdown
  categories = computed(() =>
    [
      ...new Set(
        this.crops()
          .map(crop => crop.category)
          .filter(category => Boolean(category))
      )
    ].sort()
  );

  // Recalculates automatically when crops, search or category change
  filteredCrops = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.crops().filter(crop => {
      const matchesSearch =
        !search ||
        (crop.name ?? '').toLowerCase().includes(search) ||
        (crop.category ?? '').toLowerCase().includes(search) ||
        (crop.location ?? '').toLowerCase().includes(search) ||
        (crop.farmerName ?? '').toLowerCase().includes(search);

      const matchesCategory =
        category === 'All' || crop.category === category;

      return matchesSearch && matchesCategory;
    });
  });


  ngOnInit(): void {
    // Load only in the browser (JWT token is in localStorage)
    if (isPlatformBrowser(this.platformId)) {
      this.loadCrops();
    }
  }


  // ---------- Load ----------
  loadCrops(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cropService
      .getAllCrops()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (crops) => {
          this.crops.set(crops);
        },
        error: (error) => {
          console.error('Load crops failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load crops.'
          );
        }
      });
  }


  // ---------- Filters ----------
  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategory.set('All');
  }
}
