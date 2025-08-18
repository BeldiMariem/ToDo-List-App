import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LoginRequest } from '../../core/auth/auth.models';

export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  username = '';
  password = '';
  token: string | null = null;

  onSubmit() {
    const payload: LoginRequest = {
      username: this.username,
      password: this.password
    };
    this.authService.login(payload);
    this.token = this.authService.token();
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
