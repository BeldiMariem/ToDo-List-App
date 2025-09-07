import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute, UrlTree, Event, NavigationEnd } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth/login-request.model';
import { signal, Signal } from '@angular/core';
import { Subject } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let eventsSubject: Subject<Event>;

  beforeEach(async () => {
    const tokenSignal = signal<string | null>(null);
    
    eventsSubject = new Subject<Event>();
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login'], {
      token: tokenSignal as Signal<string | null>
    });
    
    const routerSpy = jasmine.createSpyObj('Router', [
      'navigate', 
      'createUrlTree',
      'serializeUrl',
      'navigateByUrl',
      'isActive'
    ], {
      url: '/',
      events: eventsSubject.asObservable(),
      routerState: { 
        snapshot: { url: '/' },
        root: {} as any
      } as any
    });

    routerSpy.createUrlTree.and.callFake(() => ({}) as UrlTree);
    
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: {}, queryParams: {} }
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form values', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBeFalse();
    expect(component.showUsernameError).toBeFalse();
    expect(component.showPasswordError).toBeFalse();
  });

  describe('Form Validation', () => {
    it('should show error when username is empty', () => {
      component.username = '';
      component.password = 'testpassword';
      
      component.onSubmit();
      
      expect(component.showUsernameError).toBeTrue();
      expect(component.errorMessage).toBe('Please enter your username');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', () => {
      component.username = 'testuser';
      component.password = '';
      
      component.onSubmit();
      
      expect(component.showPasswordError).toBeTrue();
      expect(component.errorMessage).toBe('Please enter your password');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should clear errors when clearErrors is called', () => {
      component.errorMessage = 'Test error';
      component.showUsernameError = true;
      component.showPasswordError = true;
      
      component.clearErrors();
      
      expect(component.errorMessage).toBe('');
      expect(component.showUsernameError).toBeFalse();
      expect(component.showPasswordError).toBeFalse();
    });

    it('should clear errors when clearError is called', () => {
      component.errorMessage = 'Test error';
      component.showUsernameError = true;
      component.showPasswordError = true;
      
      component.clearError();
      
      expect(component.errorMessage).toBe('');
      expect(component.showUsernameError).toBeFalse();
      expect(component.showPasswordError).toBeFalse();
    });
  });

  describe('Login Functionality', () => {
    it('should call authService.login with correct payload when form is valid', () => {
      component.username = 'testuser';
      component.password = 'testpassword';
      
      component.onSubmit();
      
      const expectedPayload: LoginRequest = {
        username: 'testuser',
        password: 'testpassword'
      };
      
      expect(authService.login).toHaveBeenCalledWith(expectedPayload);
    });

    it('should set isLoading to true during login attempt', () => {
      component.username = 'testuser';
      component.password = 'testpassword';
      
      component.onSubmit();
      
      expect(component.isLoading).toBeTrue();
    });



    it('should show error message on failed login', fakeAsync(() => {
      component.username = 'testuser';
      component.password = 'testpassword';
      
      (authService.token as any) = signal(null);
      
      component.onSubmit();
      tick(100); 
      
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('Invalid username or password');
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

 


  afterEach(() => {
    eventsSubject.complete();
  });
});