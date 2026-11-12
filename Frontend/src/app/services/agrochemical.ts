import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  Agrochemical,
  AgrochemicalRequest
} from '../models/agrochemical';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgrochemicalService {

  private readonly apiUrl =
    `${environment.apiBaseUrl}/api/agrochemicals`;

  constructor(
    private http: HttpClient
  ) {
  }

  getAllProducts():
    Observable<Agrochemical[]> {

    return this.http.get<Agrochemical[]>(
      this.apiUrl
    );
  }

  getProduct(
    id: number
  ): Observable<Agrochemical> {

    return this.http.get<Agrochemical>(
      `${this.apiUrl}/${id}`
    );
  }

  getMyProducts():
    Observable<Agrochemical[]> {

    return this.http.get<Agrochemical[]>(
      `${this.apiUrl}/my-products`
    );
  }

  createProduct(
    request: AgrochemicalRequest
  ): Observable<Agrochemical> {

    return this.http.post<Agrochemical>(
      this.apiUrl,
      request
    );
  }

  updateProduct(
    id: number,
    request: AgrochemicalRequest
  ): Observable<unknown> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteProduct(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}