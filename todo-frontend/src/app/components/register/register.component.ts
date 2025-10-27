import { Component, inject, OnDestroy, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy, OnInit {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  showSuccessMessage = false;
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  hasAttemptedSubmit = false;
  registrationError = '';

  form = this.fb.nonNullable.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    ]]
  });

  private errorEffect = effect(() => {
    const error = this.auth.error();
    if (error && this.hasAttemptedSubmit) {
      this.registrationError = this.handleSpecificErrors(error);
    }
  });

  ngOnInit() {
    this.form.get('password')?.valueChanges
      .subscribe(password => {
        this.calculatePasswordStrength(password || '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.errorEffect.destroy();
  }

  get usernameInvalid(): boolean {
    const control = this.form.get('username');
    return !!control && control.invalid && (control.dirty || control.touched || this.hasAttemptedSubmit);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.dirty || control.touched || this.hasAttemptedSubmit);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.dirty || control.touched || this.hasAttemptedSubmit);
  }

  markAsTouched(controlName: string) {
    this.form.get(controlName)?.markAsTouched();
  }

  calculatePasswordStrength(password: string) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) this.passwordStrength = 'weak';
    else if (strength <= 3) this.passwordStrength = 'medium';
    else this.passwordStrength = 'strong';
  }

  onSubmit() {
    this.hasAttemptedSubmit = true;
    this.registrationError = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.scrollToFirstError();
      return;
    }

    this.auth.handleAuthError('');

    this.auth.register(this.form.getRawValue());
  
    this.checkRegistrationStatus();
  }

  private scrollToFirstError() {
    setTimeout(() => {
      const firstErrorElement = document.querySelector('.error-message, .field-error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  }

  private checkRegistrationStatus() {
    const checkInterval = setInterval(() => {
      if (!this.auth.loading()) {
        clearInterval(checkInterval);
        
        const error = this.auth.error();
        if (error) {
          console.log('Registration failed:', error);
        } else if (this.hasAttemptedSubmit) {
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (this.auth.loading()) {
        this.registrationError = 'Registration timeout. Please try again.';
      }
    }, 10000); 
  }

  private handleSpecificErrors(error: string): string {
      return 'Username or emailm already exists. Please choose a different username or email.';
  }

  clearError() {
    this.registrationError = '';
    this.auth.handleAuthError('');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.hasError(errorType) && (control.dirty || control.touched || this.hasAttemptedSubmit));
  }
}