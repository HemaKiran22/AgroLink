import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateProductRequest,
  FarmerProductRequest,
  SellerProductRequest,
  UpdateRequestStatus
} from '../models/product-request';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductRequestService {

  private readonly apiUrl =
    `${environment.apiBaseUrl}/productrequests`;

  constructor(
    private http: HttpClient
  ) {
  }

  createRequest(
    request: CreateProductRequest
  ): Observable<unknown> {

    return this.http.post(
      this.apiUrl,
      request
    );
  }

  getFarmerRequests():
    Observable<FarmerProductRequest[]> {

    return this.http.get<FarmerProductRequest[]>(
      `${this.apiUrl}/my-requests`
    );
  }

  getSellerRequests():
    Observable<SellerProductRequest[]> {

    return this.http.get<SellerProductRequest[]>(
      `${this.apiUrl}/seller-requests`
    );
  }

  updateStatus(
    id: number,
    request: UpdateRequestStatus
  ): Observable<unknown> {

    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }

  deleteRequest(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}