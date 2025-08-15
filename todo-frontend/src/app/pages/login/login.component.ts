import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { LoginRequest } from '../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  token: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

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
