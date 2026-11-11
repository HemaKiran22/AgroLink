import {
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FeedbackService } from '../services/feedback';
import { AuthService } from '../services/auth';
import { CreateFeedback, Feedback } from '../models/feedback';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class FeedbackPage implements OnInit {

  private feedbackService = inject(FeedbackService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  // ---------- State (signals refresh the UI automatically) ----------
  feedbackList = signal<Feedback[]>([]);
  loading = signal(false);
  submitting = signal(false);
  deletingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  // Form model (plain object because ngModel binds to it)
  feedbackForm: CreateFeedback = this.getEmptyForm();

  readonly ratingValues = [1, 2, 3, 4, 5];


  ngOnInit(): void {
    // Load only in the browser (JWT token is in localStorage)
    if (isPlatformBrowser(this.platformId)) {
      this.loadFeedback();
    }
  }


  get dashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }


  // ---------- Load ----------
  loadFeedback(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.feedbackService
      .getMyFeedback()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (feedback) => {
          this.feedbackList.set(feedback);
        },
        error: (error) => {
          console.error('Load feedback failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load your feedback.'
          );
        }
      });
  }


  // ---------- Submit ----------
  submitFeedback(form: NgForm): void {
    this.clearMessages();

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please enter a rating and feedback comment.');
      return;
    }

    const comment = this.feedbackForm.comment.trim();

    if (!comment) {
      this.errorMessage.set('Feedback comment is required.');
      return;
    }

    this.submitting.set(true);

    this.feedbackService
      .createFeedback({
        rating: this.feedbackForm.rating,
        comment
      })
      .pipe(
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            'Thank you! Your feedback was submitted successfully.'
          );
          this.feedbackForm = this.getEmptyForm();
          form.resetForm(this.feedbackForm);
          this.loadFeedback();
        },
        error: (error) => {
          console.error('Submit feedback failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to submit feedback.'
          );
        }
      });
  }


  // ---------- Delete ----------
  deleteFeedback(feedback: Feedback): void {
    if (!window.confirm('Delete this feedback?')) {
      return;
    }

    this.clearMessages();
    this.deletingId.set(feedback.id);

    this.feedbackService
      .deleteFeedback(feedback.id)
      .pipe(
        finalize(() => this.deletingId.set(null))
      )
      .subscribe({
        next: () => {
          // Remove from the list instantly, no reload needed
          this.feedbackList.update(list =>
            list.filter(item => item.id !== feedback.id)
          );
          this.successMessage.set('Feedback deleted successfully.');
        },
        error: (error) => {
          console.error('Delete feedback failed:', error);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to delete feedback.'
          );
        }
      });
  }


  // ---------- Rating ----------
  selectRating(rating: number): void {
    this.feedbackForm.rating = rating;
  }


  // ---------- Helpers ----------
  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private getEmptyForm(): CreateFeedback {
    return {
      rating: 5,
      comment: ''
    };
  }
}