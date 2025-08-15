import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthState, JwtResponse, LoginRequest, RegisterRequest, UserDTO } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly STORAGE_KEY = 'auth_token';

  private _state = signal<AuthState>({ token: null, loading: false, error: null });

  readonly token = computed(() => this._state().token);
  readonly isAuthenticated = computed(() => !!this._state().token);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) this._state.update(s => ({ ...s, token: stored }));

    effect(() => {
      const t = this.token();
      if (t) localStorage.setItem(this.STORAGE_KEY, t);
      else localStorage.removeItem(this.STORAGE_KEY);
    });
  }

  login(payload: LoginRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    this.http.post<JwtResponse>(`${environment.apiUrl}/auth/login`, payload)
      .subscribe({
        next: (res) => {
          this._state.set({ token: res.token, loading: false, error: null });
          this.router.navigateByUrl('/');
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
    this.router.navigateByUrl('/login');
  }
}