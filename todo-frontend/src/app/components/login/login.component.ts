import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  showUsernameError = false;
  showPasswordError = false;

  onSubmit() {
    this.clearErrors();

    if (!this.username.trim()) {
      this.showUsernameError = true;
      this.errorMessage = 'Please enter your username';
      return;
    }

    if (!this.password.trim()) {
      this.showPasswordError = true;
      this.errorMessage = 'Please enter your password';
      return;
    }

    this.isLoading = true;

    const payload: LoginRequest = {
      username: this.username,
      password: this.password
    };
    
    this.authService.login(payload);
    
    setTimeout(() => {
      this.checkLoginStatus();
    }, 100);
  }

   signInWithGoogle() {
    this.isLoading = true;
    this.clearErrors();
    
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  private checkLoginStatus() {
    this.isLoading = false;
    const token = this.authService.token();
    
    if (token) {
      this.router.navigate(['/boards']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }

  clearError() {
    this.errorMessage = '';
    this.showUsernameError = false;
    this.showPasswordError = false;
  }

  clearErrors() {
    this.errorMessage = '';
    this.showUsernameError = false;
    this.showPasswordError = false;
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }

  goToRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }
}