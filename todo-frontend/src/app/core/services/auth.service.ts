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

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly LOGIN_METHOD_KEY = 'login_method';
  
  private _loginMethod = signal<'password' | 'google' | null>(null);
  readonly loginMethod = computed(() => this._loginMethod());

  private _state = signal<AuthState>({ token: null, loading: false, error: null });
  private _currentUser = signal<UserDTO | null>(null);

  readonly token = computed(() => this._state().token);
  readonly isAuthenticated = computed(() => !!this._state().token);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly currentUser = computed(() => this._currentUser());

  constructor() {
    this.loadStoredAuth();

    effect(() => {
      const token = this.token();
      const currentUser = this.currentUser();
      const loginMethod = this.loginMethod();
      
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
        
        if (currentUser) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(currentUser));
        }
        
        if (loginMethod) {
          localStorage.setItem(this.LOGIN_METHOD_KEY, loginMethod);
        }
      } else {
        this.clearStoredAuth();
      }
    });
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    const loginMethod = localStorage.getItem(this.LOGIN_METHOD_KEY) as 'password' | 'google' | null;

    if (token) {
      this._state.update(s => ({ ...s, token }));
      
      if (loginMethod) {
        this._loginMethod.set(loginMethod);
      }
      
      if (user) {
        try {
          const userData = JSON.parse(user);
          this._currentUser.set(userData);
        } catch (error) {
          console.error('Failed to parse stored user data', error);
          this.fetchCurrentUserFromToken();
        }
      } else {
        this.fetchCurrentUserFromToken();
      }
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.LOGIN_METHOD_KEY);
    localStorage.removeItem("username");
    localStorage.removeItem("email");
  }

  updateCurrentUser(updatedUser: Partial<UserDTO>): void {
    const currentUser = this._currentUser();
    if (currentUser) {
      const mergedUser = { ...currentUser, ...updatedUser };
      this._currentUser.set(mergedUser);
      localStorage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
    }
  }

  login(payload: LoginRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));

    this.http.post<JwtResponse>(`${environment.apiUrl}/auth/login`, payload)
      .subscribe({
        next: (res) => {
          this._state.set({ token: res.token, loading: false, error: null });
          this._loginMethod.set('password');
          localStorage.setItem("username", payload.username);
          this.fetchCurrentUserFromToken();
          this.router.navigateByUrl('/boards');
        },
        error: (err) => {
          const msg = err?.error?.message || 'Login failed';
          this._state.set({ token: null, loading: false, error: msg });
        }
      });
  }

  handleOAuthToken(token: string) {
    this._state.set({ token: token, loading: false, error: null });
    this._loginMethod.set('google');
    this.fetchCurrentUserFromToken();
  }

  register(payload: RegisterRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    this.http.post<UserDTO>(`${environment.apiUrl}/auth/register`, payload)
      .subscribe({
        next: (user) => {
          this._state.update(s => ({ ...s, loading: false, error: null }));
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          let msg = 'Registration failed';
          
          if (err.status === 409) { 
            msg = err.error?.message || 'User already exists with these credentials';
          } else if (err.status === 400) { 
            msg = err.error?.message || 'Invalid registration data';
          } else if (err.error?.message) {
            msg = err.error.message;
          }
          
          this._state.update(s => ({ ...s, loading: false, error: msg }));
        }
      });
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
            localStorage.setItem("email", user.email!);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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

  handleAuthError(errorMessage: string) {
    this._state.update(s => ({ ...s, loading: false, error: errorMessage }));
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

  getUserEmail(): string {
    const currentUser = this._currentUser();
    if (currentUser?.email) {
      return currentUser.email;
    }
    
    const token = this.token();
    if (!token) return '';

    try {
      const payload = this.decodeJwt(token);
      return payload.email || '';
    } catch (e) {
      console.error('Failed to get email from token', e);
      return '';
    }
  }

  getUserName(): string {
    const currentUser = this._currentUser();
    if (currentUser?.username) {
      return currentUser.username;
    }
    
    const token = this.token();
    if (!token) return '';

    try {
      const payload = this.decodeJwt(token);
      return payload.username || '';
    } catch (e) {
      console.error('Failed to get username from token', e);
      return '';
    }
  }

  forgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password?email=${email}`, null, {
      responseType: 'text'
    });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(
      `${environment.apiUrl}/auth/reset-password`,
      { token, newPassword },
      { responseType: 'text' }
    );
  }

  logout() {
    this._state.set({ token: null, loading: false, error: null });
    this._currentUser.set(null);
    this._loginMethod.set(null);
    this.clearStoredAuth();
    this.router.navigateByUrl('/login');
  }

  hasPasswordLogin(): boolean {
    return this.loginMethod() === 'password';
  }

  clearAllAuthData() {
    this.logout();
    sessionStorage.clear();
  }
  
  isTokenValid(): boolean {
    const token = this.token();
    if (!token) return false;

    try {
      const payload = this.decodeJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  }
}