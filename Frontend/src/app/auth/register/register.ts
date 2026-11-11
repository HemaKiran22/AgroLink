import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { RegisterRequest } from '../../models/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Letters, _ and - only. Single spaces between words. At least one letter.
  readonly namePattern = '^(?=.*[A-Za-z])[A-Za-z_-]+( [A-Za-z_-]+)*$';

  // ---------- State ----------
  loading = signal(false);
  errorMessage = signal('');

  // Form model (plain object because ngModel binds to it)
  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    role: 'Farmer'
  };

  confirmPassword = '';


  register(form: NgForm): void {
    this.errorMessage.set('');

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please complete all fields correctly.');
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage.set('Password and confirm password do not match.');
      return;
    }

    this.loading.set(true);

    this.authService
      .register({
        ...this.registerData,
        name: this.registerData.name.trim(),
        email: this.registerData.email.trim()
      })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.toastService.success('Successfully registered! Please login.', 5000);
          this.router.navigateByUrl('/login');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Registration failed:', error);
          this.errorMessage.set(this.getErrorMessage(error));
        }
      });
  }


  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot connect to the server. Please check that the API is running.';
    }

    // ASP.NET validation errors come as { errors: { Name: ["..."] } }
    const validationErrors = error.error?.errors;

    if (validationErrors) {
      const firstError = Object.values(validationErrors).flat()[0];

      if (typeof firstError === 'string') {
        return firstError;
      }
    }

    return error.error?.message ?? 'Registration failed. Please try again.';
  }
}