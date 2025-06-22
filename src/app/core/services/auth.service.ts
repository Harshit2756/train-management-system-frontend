import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  User,
  UserRegistrationRequest,
} from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/api/v1/users';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.authenticated) {
            const user: User = {
              userId: response.userId,
              username: response.username,
              email: response.email,
              role: response.role,
              phone: '',
            };
            this.storeUser(user);
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  register(userData: UserRegistrationRequest): Observable<User> {
    const registrationData = { ...userData, role: 'USER' };
    return this.http.post<User>(`${this.baseUrl}/register`, registrationData);
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/exists/username/${username}`
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  private storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    return this.currentUserValue;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }
}
