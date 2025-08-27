import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthState } from '../models/auth/auth-state.model';
import { JwtResponse } from '../models/auth/jwt-response.model';
import { LoginRequest } from '../models/auth/login-request.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { UserDTO } from '../models/user/user-dto.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly STORAGE_KEY = 'auth_token';
  private readonly USER_STORAGE_KEY = 'current_user';

  private _state = signal<AuthState>({ token: null, loading: false, error: null });
  private _currentUser = signal<UserDTO | null>(null);

  readonly token = computed(() => this._state().token);
  readonly isAuthenticated = computed(() => !!this._state().token);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly currentUser = computed(() => this._currentUser());

  constructor() {
    const storedToken = localStorage.getItem(this.STORAGE_KEY);
    const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);

    if (storedToken) {
      this._state.update(s => ({ ...s, token: storedToken }));
    }

    if (storedUser) {
      try {
        this._currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data', e);
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    }

    effect(() => {
      const token = this.token();
      if (token) {
        localStorage.setItem(this.STORAGE_KEY, token);
        if (!this._currentUser()) {
          this.fetchCurrentUserFromToken();
        }
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.USER_STORAGE_KEY);
        this._currentUser.set(null);
      }
    });

    effect(() => {
      const user = this._currentUser();
      if (user) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    });
  }

  login(payload: LoginRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    this.http.post<JwtResponse>(`${environment.apiUrl}/auth/login`, payload)
      .subscribe({
        next: (res) => {
          this._state.set({ token: res.token, loading: false, error: null });
          this.fetchCurrentUserFromToken();
          this.router.navigateByUrl('/boards');
        },
        error: (err) => {
          const msg = err?.error?.message || 'Login failed';
          this._state.set({ token: null, loading: false, error: msg });
        }
      });
  }

  register(payload: RegisterRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    this.http.post<UserDTO>(`${environment.apiUrl}/auth/register`, payload)
      .subscribe({
        next: () => {
          this._state.update(s => ({ ...s, loading: false }));
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          const msg = err?.error?.message || 'Registration failed';
          this._state.update(s => ({ ...s, loading: false, error: msg }));
        }
      });
  }

  logout() {
    this._state.set({ token: null, loading: false, error: null });
    this._currentUser.set(null);
    this.router.navigateByUrl('/login');
  }

  getCurrentUser(): UserDTO {
    const currentUser = this._currentUser();
    if (currentUser) {
      return currentUser;
    }
    return {
      id: 0,
      username: '',
      email: ''
    };
  }

  private fetchCurrentUserFromToken() {
    const token = this.token();
    if (!token) return;

    try {
      const payload = this.decodeJwt(token);
      const username = payload.sub;

      this.http.get<UserDTO>(`${environment.apiUrl}/users/getUserByUsername/${username}`)
        .subscribe({
          next: (user) => {
            this._currentUser.set(user);
          },
          error: (err) => {
            const msg = err?.error?.message || 'Failed to fetch user';
            this._state.update(s => ({ ...s, error: msg }));


          }
        });
    } catch (e) {
      console.error('Failed to decode JWT token', e);
    }
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return {};
    }
  }

  isOwner(resourceOwnerId: number): boolean {
    const user = this.getCurrentUser();
    return user.id === resourceOwnerId;
  }
}