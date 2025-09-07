import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginRequest } from '../models/auth/login-request.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { UserDTO } from '../models/user/user-dto.model';
import { environment } from '../../../environments/environment';

const mockLoginRequest: LoginRequest = { username: 'testuser', password: 'password123' };
const mockRegisterRequest: RegisterRequest = { username: 'testuser', email: 'test@test.com', password: 'password123' };
const mockUser: UserDTO = { id: 1, username: 'testuser', email: 'test@test.com' };

describe('AuthService', () => {
  let service: AuthService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem').and.stub();
    spyOn(localStorage, 'removeItem').and.stub();
    spyOn(localStorage, 'clear').and.stub();
  });

  afterEach(() => {
    service['_state'].set({ token: null, loading: false, error: null });
    service['_currentUser'].set(null);
    service['_loginMethod'].set(null);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {

    it('should make POST request with username and password', () => {
      httpClientSpy.post.and.returnValue(of({ token: 'simple-token' }));
      
      service.login(mockLoginRequest);
      
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/auth/login`,
        { username: 'testuser', password: 'password123' }
      );
    });

    it('should handle successful login', fakeAsync(() => {
      const simpleToken = 'simple-token';
      httpClientSpy.post.and.returnValue(of({ token: simpleToken }));

      service.login(mockLoginRequest);
      tick();
      
      expect(service.token()).toBe(simpleToken);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
      expect(service.loginMethod()).toBe('password');
    }));

    it('should handle login error', fakeAsync(() => {
      const errorResponse = { error: { message: 'Invalid credentials' } };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
      
      service.login(mockLoginRequest);
      tick();
      
      expect(service.token()).toBeNull();
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBe('Invalid credentials');
    }));
  });

  describe('register()', () => {
    it('should handle successful registration', fakeAsync(() => {
      httpClientSpy.post.and.returnValue(of(mockUser));
      
      service.register(mockRegisterRequest);
      tick();
      
      expect(service.loading()).toBeFalse();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    }));

    it('should handle registration error', fakeAsync(() => {
      const errorResponse = { error: { message: 'Username already exists' } };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
      
      service.register(mockRegisterRequest);
      tick();
      
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBe('Username already exists');
    }));
  });

  describe('logout()', () => {
    it('should clear all auth data and navigate to login', () => {
      service['_state'].set({ token: 'test-token', loading: false, error: null });
      service['_currentUser'].set(mockUser);
      
      service.logout();
      
      expect(service.token()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.loginMethod()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('current_user');
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });

  describe('Password reset methods', () => {
    it('forgotPassword should make POST request with email', fakeAsync(() => {
      const mockResponse = 'Email sent';
      httpClientSpy.post.and.returnValue(of(mockResponse));
      
      service.forgotPassword('test@test.com').subscribe(response => {
        expect(response).toBe('Email sent');
      });
      
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/auth/forgot-password?email=test@test.com`,
        null,
        jasmine.objectContaining({ responseType: 'text' })
      );
    }));

    it('resetPassword should make POST request', fakeAsync(() => {
      const mockResponse = 'Password reset successful';
      httpClientSpy.post.and.returnValue(of(mockResponse));
      
      service.resetPassword('reset-token', 'newPassword123').subscribe(response => {
        expect(response).toBe('Password reset successful');
      });
      
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/auth/reset-password`,
        { token: 'reset-token', newPassword: 'newPassword123' },
        jasmine.objectContaining({ responseType: 'text' })
      );
    }));
  });

  describe('User info methods', () => {
    it('getCurrentUser should return current user or default', () => {
      service['_currentUser'].set(mockUser);
      
      expect(service.getCurrentUser()).toEqual(mockUser);
      
      service['_currentUser'].set(null);
      
      expect(service.getCurrentUser()).toEqual({ id: 0, username: '', email: '' });
    });
  });

  describe('updateCurrentUser()', () => {
    it('should update current user with partial data', () => {
      service['_currentUser'].set({...mockUser});      
      service.updateCurrentUser({ username: 'updateduser' });
      
      expect(service.currentUser()?.username).toBe('updateduser');
      expect(service.currentUser()?.email).toBe('test@test.com');
    });

    it('should do nothing if no current user', () => {
      service['_currentUser'].set(null);
      service.updateCurrentUser({ username: 'updateduser' });
      
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('hasPasswordLogin()', () => {
    it('should return true if login method is password', () => {
      service['_loginMethod'].set('password');
      
      expect(service.hasPasswordLogin()).toBeTrue();
    });

    it('should return false if login method is not password', () => {
      service['_loginMethod'].set('google');
      
      expect(service.hasPasswordLogin()).toBeFalse();
      
      service['_loginMethod'].set(null);
      
      expect(service.hasPasswordLogin()).toBeFalse();
    });
  });
});