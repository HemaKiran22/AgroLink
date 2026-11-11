import {
  Injectable,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/auth';

import {
  User,
  UserRole
} from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://localhost:5109/api/auth';

  private readonly platformId =
    inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);


  constructor(
    private http: HttpClient
  ) {
  }


  // =========================
  // REGISTER
  // =========================

  register(
    request: RegisterRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/register`,
        request
      )
      .pipe(
        tap(response => {

          this.saveAuthentication(
            response
          );

        })
      );
  }


  // =========================
  // LOGIN
  // =========================

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        request
      )
      .pipe(
        tap(response => {

          this.saveAuthentication(
            response
          );

        })
      );
  }


  // =========================
  // CURRENT USER
  // =========================

  getCurrentUser():
    Observable<User> {

    return this.http.get<User>(
      `${this.apiUrl}/me`
    );
  }


  // =========================
  // GET TOKEN
  // =========================

  getToken():
    string | null {

    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem(
      'token'
    );
  }


  // =========================
  // GET STORED USER
  // =========================

  getStoredUser():
    User | null {

    if (!this.isBrowser) {
      return null;
    }

    const userJson =
      localStorage.getItem(
        'user'
      );

    if (!userJson) {
      return null;
    }

    try {

      return JSON.parse(
        userJson
      ) as User;

    }
    catch {

      this.logout();

      return null;

    }
  }


  // =========================
  // GET ROLE
  // =========================

  getRole():
    UserRole | null {

    return (
      this.getStoredUser()?.role
      ?? null
    );
  }


  // =========================
  // IS LOGGED IN
  // =========================

  isLoggedIn(): boolean {

    if (!this.isBrowser) {
      return false;
    }

    const token =
      this.getToken();

    if (!token) {
      return false;
    }

    try {

      const parts =
        token.split('.');

      if (parts.length !== 3) {

        this.logout();

        return false;
      }


      const payload =
        JSON.parse(
          this.decodeBase64Url(
            parts[1]
          )
        );


      if (
        typeof payload.exp !==
        'number'
      ) {

        this.logout();

        return false;
      }


      const expirationTime =
        payload.exp * 1000;


      if (
        Date.now() >=
        expirationTime
      ) {

        this.logout();

        return false;
      }


      return true;

    }
    catch {

      this.logout();

      return false;

    }
  }


  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
    );
  }


  // =========================
  // DASHBOARD ROUTE
  // =========================

  getDashboardRoute():
    string {

    const role =
      this.getRole();


    if (role === 'Farmer') {

      return '/farmer/dashboard';

    }


    if (role === 'Seller') {

      return '/seller/dashboard';

    }


    return '/login';
  }


  // =========================
  // SAVE AUTHENTICATION
  // =========================

  private saveAuthentication(
    response: AuthResponse
  ): void {

    if (!this.isBrowser) {
      return;
    }


    localStorage.setItem(
      'token',
      response.token
    );


    localStorage.setItem(
      'user',
      JSON.stringify(
        response.user
      )
    );
  }


  // =========================
  // JWT PAYLOAD DECODER
  // =========================

  private decodeBase64Url(
    value: string
  ): string {

    const base64 =
      value
        .replace(/-/g, '+')
        .replace(/_/g, '/');


    const padded =
      base64.padEnd(
        Math.ceil(
          base64.length / 4
        ) * 4,
        '='
      );


    const binary =
      atob(padded);


    const bytes =
      Array.from(binary)
        .map(character =>
          '%' +
          character
            .charCodeAt(0)
            .toString(16)
            .padStart(2, '0')
        )
        .join('');


    return decodeURIComponent(
      bytes
    );
  }
}