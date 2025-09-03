import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  newPassword!: string;
  confirmPassword!: string;
  message!: string ;
  token!: string ;
  isLoading = false;
  showPasswordError = false;
  showConfirmError = false;
  confirmError = '';
  isSuccess = false;

    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);


  

  onSubmit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.clearErrors();
    
    let hasError = false;
    
    if (!this.newPassword.trim()) {
      this.showPasswordError = true;
      hasError = true;
    }
    
    if (!this.confirmPassword.trim()) {
      this.showConfirmError = true;
      this.confirmError = 'Please confirm your password';
      hasError = true;
    } else if (this.newPassword !== this.confirmPassword) {
      this.showConfirmError = true;
      this.confirmError = 'Passwords do not match';
      hasError = true;
    }
    
    if (hasError) {
      this.message = 'Please fix the errors above';
      return;
    }
    
    if (!this.token) {
      this.message = 'Invalid or expired reset token';
      return;
    }

    this.isLoading = true;
    
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = 'Password successfully reset';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = err.error || 'Something went wrong. Please try again.';
      }
    });
  }

  clearErrors() {
    this.message = '';
    this.showPasswordError = false;
    this.showConfirmError = false;
    this.confirmError = '';
  }
}