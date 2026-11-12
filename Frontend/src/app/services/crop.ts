import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  Crop,
  CropRequest
} from '../models/crop';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CropService {

  private readonly apiUrl =
    `${environment.apiBaseUrl}/api/crops`;

  constructor(
    private http: HttpClient
  ) {
  }

  getAllCrops(): Observable<Crop[]> {

    return this.http.get<Crop[]>(
      this.apiUrl
    );
  }

  getMyCrops(): Observable<Crop[]> {

    return this.http.get<Crop[]>(
      `${this.apiUrl}/my-crops`
    );
  }

  getCrop(id: number): Observable<Crop> {

    return this.http.get<Crop>(
      `${this.apiUrl}/${id}`
    );
  }

  createCrop(
    crop: CropRequest
  ): Observable<Crop> {

    return this.http.post<Crop>(
      this.apiUrl,
      crop
    );
  }

  updateCrop(
    id: number,
    crop: CropRequest
  ): Observable<unknown> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      crop
    );
  }

  deleteCrop(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}