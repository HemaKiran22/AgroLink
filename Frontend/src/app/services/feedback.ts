import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateFeedback,
  Feedback
} from '../models/feedback';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private readonly apiUrl =
    `${environment.apiBaseUrl}/api/feedback`;

  constructor(
    private http: HttpClient
  ) {
  }

  getAllFeedback():
    Observable<Feedback[]> {

    return this.http.get<Feedback[]>(
      this.apiUrl
    );
  }

  getMyFeedback():
    Observable<Feedback[]> {

    return this.http.get<Feedback[]>(
      `${this.apiUrl}/my-feedback`
    );
  }

  createFeedback(
    request: CreateFeedback
  ): Observable<unknown> {

    return this.http.post(
      this.apiUrl,
      request
    );
  }

  deleteFeedback(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}