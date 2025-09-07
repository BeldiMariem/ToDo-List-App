import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;
  let errorSignal: ReturnType<typeof signal<string | null>>;

  beforeEach(async () => {
    loadingSignal = signal(false);
    errorSignal = signal(null);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register'], {
      loading: loadingSignal,
      error: errorSignal
    });

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]) 
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showSuccessMessage).toBeFalse();
    expect(component.passwordStrength).toBe('weak');
    expect(component.hasAttemptedSubmit).toBeFalse();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('username')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should validate username requirements', () => {
      const username = component.form.get('username');
      
      username?.setValue('');
      expect(username?.hasError('required')).toBeTrue();
      
      username?.setValue('ab');
      expect(username?.hasError('minlength')).toBeTrue();
      
      username?.setValue('user@name');
      expect(username?.hasError('pattern')).toBeTrue();
      
      username?.setValue('valid_user123');
      expect(username?.valid).toBeTrue();
    });

    it('should validate email requirements', () => {
      const email = component.form.get('email');
      
      email?.setValue('');
      expect(email?.hasError('required')).toBeTrue();
      
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBeTrue();
      
      email?.setValue('test@example.com');
      expect(email?.valid).toBeTrue();
    });

    it('should validate password requirements', () => {
      const password = component.form.get('password');
      
      password?.setValue('');
      expect(password?.hasError('required')).toBeTrue();
      
      password?.setValue('short');
      expect(password?.hasError('minlength')).toBeTrue();
      
      password?.setValue('alllowercase');
      expect(password?.hasError('pattern')).toBeTrue();
      
      password?.setValue('Valid123');
      expect(password?.valid).toBeTrue();
    });
  });

  describe('Password Strength Calculation', () => {
    it('should calculate weak password strength', () => {
      component.calculatePasswordStrength('weak');
      expect(component.passwordStrength).toBe('weak');
      
      component.calculatePasswordStrength('short');
      expect(component.passwordStrength).toBe('weak');
    });

    it('should calculate medium password strength', () => {
      component.calculatePasswordStrength('Medium1');
      expect(component.passwordStrength).toBe('medium');
      
      component.calculatePasswordStrength('LongEnough');
      expect(component.passwordStrength).toBe('medium');
    });

    it('should calculate strong password strength', () => {
      component.calculatePasswordStrength('Strong123!');
      expect(component.passwordStrength).toBe('strong');
      
      component.calculatePasswordStrength('VeryStrong123!@#');
      expect(component.passwordStrength).toBe('strong');
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.onSubmit();
      
      expect(component.hasAttemptedSubmit).toBeTrue();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should submit valid form', () => {
      component.form.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      });
      
      component.onSubmit();
      
      expect(component.hasAttemptedSubmit).toBeTrue();
      expect(authService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      });
    });

    it('should mark all fields as touched on submit', () => {
      const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched');
      
      component.onSubmit();
      
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Registration Status Check', () => {
    beforeEach(() => {
      component.form.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      });
    });

   

    it('should not show success message when there is an error', fakeAsync(() => {
      component.onSubmit();
      
      loadingSignal.set(false);
      errorSignal.set('Registration failed');
      
      tick(100);
      
      expect(component.showSuccessMessage).toBeFalse();
    }));

    it('should handle ongoing registration', fakeAsync(() => {
      component.onSubmit();
      
      loadingSignal.set(true);
      
      tick(100);
      
      expect(component.showSuccessMessage).toBeFalse();
    }));
  });

  describe('Helper Methods', () => {
    it('should mark control as touched', () => {
      const markAsTouchedSpy = spyOn(component.form.get('username')!, 'markAsTouched');
      
      component.markAsTouched('username');
      
      expect(markAsTouchedSpy).toHaveBeenCalled();
    });

    it('should return username invalid state', () => {
      const control = component.form.get('username');
      control?.setValue('');
      control?.markAsTouched();
      
      expect(component.usernameInvalid).toBeTrue();
    });

    it('should return email invalid state', () => {
      const control = component.form.get('email');
      control?.setValue('invalid');
      control?.markAsTouched();
      
      expect(component.emailInvalid).toBeTrue();
    });

    it('should return password invalid state', () => {
      const control = component.form.get('password');
      control?.setValue('short');
      control?.markAsTouched();
      
      expect(component.passwordInvalid).toBeTrue();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should subscribe to password changes on init', () => {
      const passwordControl = component.form.get('password');
      const calculateSpy = spyOn(component, 'calculatePasswordStrength');
      
      passwordControl?.setValue('Test123');
      
      expect(calculateSpy).toHaveBeenCalledWith('Test123');
    });

    it('should unsubscribe from observables on destroy', () => {
      const nextSpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Password Strength Subscription', () => {
    it('should update password strength on password changes', () => {
      const passwordControl = component.form.get('password');
      
      passwordControl?.setValue('Weak');
      expect(component.passwordStrength).toBe('weak');
      
      passwordControl?.setValue('Medium1');
      expect(component.passwordStrength).toBe('medium');
      
      passwordControl?.setValue('Strong123!');
      expect(component.passwordStrength).toBe('strong');
    });
  });
});