import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bar">
      <a routerLink="/">Trello-like</a>
      <span class="spacer"></span>
      <button *ngIf="auth.isAuthenticated()" (click)="auth.logout()">Logout</button>
    </header>
  `,
  styles: [`
    .bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      background-color: #f9f9f9;
    }
    .bar a {
      font-weight: bold;
      text-decoration: none;
      color: #333;
    }
    .spacer {
      flex: 1;
    }
    button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #c0392b;
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
}
