import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use relative URL when using proxy, or absolute URL for direct backend calls
  private readonly API_BASE_URL = '/api'; // This will be proxied to http://localhost:8081/api
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    // Initialize session on service creation
    this.initializeSession();
  }

  private initializeSession(): void {
    const storedUser = localStorage.getItem('currentUser');
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    
    if (storedUser && sessionTimestamp) {
      try {
        const user = JSON.parse(storedUser);
        const timestamp = parseInt(sessionTimestamp);
        const currentTime = Date.now();
        
        // Check if session is still valid (24 hours)
        const sessionValid = (currentTime - timestamp) < (24 * 60 * 60 * 1000);
        
        if (sessionValid) {
          this.currentUserSubject.next(user);
          console.log('Session restored for user:', user.email);
        } else {
          console.log('Session expired, clearing storage');
          this.clearSession();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionTimestamp');
    this.currentUserSubject.next(null);
  }

  private setSession(user: LoginResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('sessionTimestamp', Date.now().toString());
    this.currentUserSubject.next(user);
  }

  register(user: User): Observable<ApiResponse<any>> {
    console.log('Registering user:', user);
    return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/register`, user, this.httpOptions)
      .pipe(
        tap(response => console.log('Registration response:', response)),
        catchError(this.handleError)
      );
  }

  registerAdmin(user: User): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/admin/register`, user, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    console.log('Login credentials:', credentials);
    console.log('Login URL:', `${this.API_BASE_URL}/login`);
    
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_BASE_URL}/login`, credentials, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response.success && response.data) {
            this.setSession(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.clearSession();
    console.log('User logged out successfully');
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Additional check for session validity
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    if (!sessionTimestamp) return false;
    
    const timestamp = parseInt(sessionTimestamp);
    const currentTime = Date.now();
    const sessionValid = (currentTime - timestamp) < (24 * 60 * 60 * 1000);
    
    if (!sessionValid) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.userType === 'ADMIN';
  }

  isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.userType === 'CUSTOMER';
  }

  getSessionInfo(): { user: LoginResponse | null; isValid: boolean; remainingTime: number } {
    const user = this.currentUserSubject.value;
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    
    if (!user || !sessionTimestamp) {
      return { user: null, isValid: false, remainingTime: 0 };
    }
    
    const timestamp = parseInt(sessionTimestamp);
    const currentTime = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    const remainingTime = Math.max(0, sessionDuration - (currentTime - timestamp));
    const isValid = remainingTime > 0;
    
    return { user, isValid, remainingTime };
  }

  refreshSession(): void {
    if (this.isLoggedIn()) {
      const user = this.getCurrentUser();
      if (user) {
        this.setSession(user);
        console.log('Session refreshed for user:', user.email);
      }
    }
  }

  activateAccount(userId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_BASE_URL}/activate/${userId}`, {}, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
    console.error('Error details:', error.error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (error.status === 404) {
        errorMessage = 'API endpoint not found. Please check the API URL.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }
    
    return throwError(() => ({ message: errorMessage }));
  }
} 