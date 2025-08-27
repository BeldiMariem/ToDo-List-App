import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../app/layouts/main-layout.component';

export const routes: Routes = [
  
  { path: 'welcome', loadComponent: () => import('../app/components/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'login', loadComponent: () => import('../app/components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../app/components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'oauth2/redirect', loadComponent: () => import('../app/components/oauth/oauth-redirect.component').then(m => m.OAuthRedirectComponent) },
  { path: 'logout', loadComponent: () => import('../app/components/logout/logout.component').then(m => m.LogoutComponent) },
  { path: '', loadComponent: () => import('../app/components/welcome/welcome.component').then(m => m.WelcomeComponent) },



  {
    path: '',
    component: MainLayoutComponent, 
    children: [
      { path: 'boards', loadComponent: () => import('../app/components/board/board-manegement/board-manegement.component').then(m => m.BoardManegementComponent) },
      { path: 'board-detail/:id', loadComponent: () => import('../app/components/board/board-detail/board-detail.component').then(m => m.BoardDetailComponent) }
    ]
  }

];
