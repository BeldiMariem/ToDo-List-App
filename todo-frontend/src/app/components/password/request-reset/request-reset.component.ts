import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-request-reset',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './request-reset.component.html',
  styleUrls: ['./request-reset.component.scss']
})
export class RequestResetComponent {
  email = '';
  message = '';
  isLoading = false;
  showEmailError = false;
  isSuccess = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.clearError();
    
    if (!this.validateEmail(this.email)) {
      this.showEmailError = true;
      this.message = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = 'Password reset email sent. Please check your inbox.';
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message =  'Something went wrong. Please try again.';
      }
    });
  }

  clearError() {
    this.message = '';
    this.showEmailError = false;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}