// src/app/components/oauth-redirect/oauth-redirect.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-oauth-redirect',
  template: `
    <div class="redirect-container">
      <p>Processing your login...</p>
    </div>
  `
})
export class OAuthRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.handleOAuthToken(token);
        this.router.navigate(['/boards']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}