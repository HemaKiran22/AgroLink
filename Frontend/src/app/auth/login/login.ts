import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { LoginRequest } from '../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // ---------- State ----------
  loading = signal(false);

  // Form model (plain object because ngModel binds to it)
  loginData: LoginRequest = {
    email: '',
    password: ''
  };


  login(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.toastService.error('Please enter a valid email and password.');
      return;
    }

    this.loading.set(true);

    this.authService
      .login({
        email: this.loginData.email.trim(),
        password: this.loginData.password
      })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.toastService.success('Login successful! Welcome to AgroLink.', 5000);

          this.router.navigateByUrl(
            this.authService.getDashboardRoute()
          );
        },
        error: (error: HttpErrorResponse) => {
          console.error('Login failed:', error);
          this.toastService.error(this.getErrorMessage(error), 5000);
        }
      });
  }


  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot connect to the server. Please check that the API is running.';
    }

    if (error.status === 400 || error.status === 401) {
      return error.error?.message ?? 'Invalid email or password.';
    }

    return error.error?.message ?? 'Login failed. Please try again.';
  }
}