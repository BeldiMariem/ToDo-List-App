import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: `
    <div class="logout-container">
      <p>Logging out...</p>
    </div>
  `,
  styles: [`
    .logout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  `]
})
export class LogoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService.logout();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}