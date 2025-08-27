import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

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

  ngOnInit() {
    this.form.get('password')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(password => {
        this.calculatePasswordStrength(password || '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get usernameInvalid(): boolean {
    const control = this.form.get('username');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.dirty || control.touched);
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
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      const firstErrorElement = document.querySelector('.error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.auth.register(this.form.getRawValue());
  
    this.checkRegistrationStatus();
  }

  private checkRegistrationStatus() {
    const checkInterval = setInterval(() => {
      if (!this.auth.loading()) {
        clearInterval(checkInterval);
        
        if (!this.auth.error() && this.hasAttemptedSubmit) {
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    }, 100);
  }
}