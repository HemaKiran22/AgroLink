import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CropService } from '../../services/crop';
import { Crop, CropRequest } from '../../models/crop';

@Component({
  selector: 'app-crops',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './crops.html',
  styleUrl: './crops.css'
})
export class Crops implements OnInit {

  private cropService = inject(CropService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State (signals refresh the UI automatically) ----------
  crops = signal<Crop[]>([]);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showForm = signal(false);
  editingCropId = signal<number | null>(null);

  // Form model (plain object because ngModel binds to it)
  cropForm: CropRequest = this.getEmptyForm();


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
      .getMyCrops()
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


  // ---------- Form open / close ----------
  openAddForm(): void {
    this.editingCropId.set(null);
    this.resetForm();
    this.showForm.set(true);
    this.clearMessages();
  }

  editCrop(crop: Crop): void {
    this.editingCropId.set(crop.id);

    this.cropForm = {
      name: crop.name,
      category: crop.category,
      description: crop.description,
      pricePerKg: crop.pricePerKg,
      quantityInKg: crop.quantityInKg,
      location: crop.location
    };

    this.showForm.set(true);
    this.clearMessages();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingCropId.set(null);
    this.resetForm();
  }


  // ---------- Save (Add / Update) ----------
  saveCrop(form: NgForm): void {
    this.clearMessages();

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please complete all required crop details.');
      return;
    }

    this.saving.set(true);

    const id = this.editingCropId();

    const request$ = id !== null
      ? this.cropService.updateCrop(id, this.cropForm)
      : this.cropService.createCrop(this.cropForm);

    request$
      .pipe(
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            id !== null ? 'Crop updated successfully.' : 'Crop added successfully.'
          );
          this.showForm.set(false);
          this.editingCropId.set(null);
          this.resetForm();
          this.loadCrops();
        },
        error: (error) => {
          console.error('Save crop failed:', error);
          this.errorMessage.set(
            error.error?.message ??
            (id !== null ? 'Unable to update crop.' : 'Unable to add crop.')
          );
        }
      });
  }


  // ---------- Delete ----------
  deleteCrop(crop: Crop): void {
    if (!window.confirm(`Delete "${crop.name}"?`)) {
      return;
    }

    this.clearMessages();

    this.cropService
      .deleteCrop(crop.id)
      .subscribe({
        next: () => {
          this.successMessage.set('Crop deleted successfully.');
          // Remove from list instantly, no reload needed
          this.crops.update(list => list.filter(c => c.id !== crop.id));
        },
        error: (error) => {
          console.error('Delete crop failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to delete crop.'
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
    this.cropForm = this.getEmptyForm();
  }

  private getEmptyForm(): CropRequest {
    return {
      name: '',
      category: '',
      description: '',
      pricePerKg: 0,
      quantityInKg: 0,
      location: ''
    };
  }
}