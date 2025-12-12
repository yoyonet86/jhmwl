import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { 
  LoginRequest, 
  PhoneLoginRequest, 
  AuthResponse, 
  User, 
  RefreshTokenRequest,
  CaptchaChallenge,
  VerificationCodeRequest,
  CaptchaResponse,
  VerificationCodeResponse,
  ChangePasswordRequest
} from '../models/auth.models';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  aud: string;
  iss: string;
  userId: number;
  organizationId: number;
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = environment.security.tokenStorageKey;
  private readonly refreshTokenKey = environment.security.refreshTokenStorageKey;
  private readonly userKey = environment.security.userStorageKey;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private refreshTokenTimeout?: any;

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user && !this.isTokenExpired(token)) {
      this.setAuth(token, user);
    } else {
      this.clearAuth();
    }
  }

  // Authentication Methods
  loginWithPassword(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/password`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.accessToken, response.user);
            this.startRefreshTokenTimer();
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  loginWithPhone(request: PhoneLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/code`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.accessToken, response.user);
            this.startRefreshTokenTimer();
          }
        }),
        catchError(error => {
          console.error('Phone login failed:', error);
          return throwError(() => error);
        })
      );
  }

  requestVerificationCode(request: VerificationCodeRequest): Observable<VerificationCodeResponse> {
    return this.http.post<VerificationCodeResponse>(`${this.apiUrl}/auth/request-code`, request);
  }

  getCaptcha(): Observable<CaptchaResponse> {
    return this.http.get<CaptchaResponse>(`${this.apiUrl}/auth/captcha`);
  }

  verifyCaptcha(token: string, answer: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auth/verify-captcha`, {
      token,
      answer
    });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuth(response.accessToken, response.user);
            this.startRefreshTokenTimer();
          }
        }),
        catchError(error => {
          this.clearAuth();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      // Optional: Call backend to invalidate token
      this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
        next: () => {},
        error: () => {} // Ignore errors on logout
      });
    }
    
    this.clearAuth();
    this.stopRefreshTokenTimer();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(user => {
          this.setStoredUser(user);
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Failed to get current user:', error);
          return throwError(() => error);
        })
      );
  }

  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auth/change-password`, request);
  }

  // Token Management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload: JWTPayload = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationTime(token: string): Date | null {
    try {
      const payload: JWTPayload = jwtDecode(token);
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Helper Methods
  private setAuth(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, (user as any).refreshToken || '');
    this.setStoredUser(user);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private setStoredUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Auto-refresh token timer
  private startRefreshTokenTimer(): void {
    const token = this.getToken();
    if (!token) return;

    const expiration = this.getTokenExpirationTime(token);
    if (!expiration) return;

    const timeout = expiration.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry
    
    if (timeout > 0) {
      this.refreshTokenTimeout = timer(timeout).subscribe(() => {
        this.refreshToken().subscribe();
      });
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      this.refreshTokenTimeout.unsubscribe();
      this.refreshTokenTimeout = undefined;
    }
  }

  // Permission Checking
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.permissions) return false;
    
    return user.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.roles) return false;
    
    return roles.some(role => user.roles.includes(role));
  }
}