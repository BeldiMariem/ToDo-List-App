import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../app/layouts/main-layout.component';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  
  { path: 'welcome', loadComponent: () => import('../app/components/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'login', loadComponent: () => import('../app/components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../app/components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'oauth2/redirect', loadComponent: () => import('../app/components/oauth/oauth-redirect.component').then(m => m.OAuthRedirectComponent) },
  { path: 'logout', loadComponent: () => import('../app/components/logout/logout.component').then(m => m.LogoutComponent) },
  { path: 'reset-password', loadComponent: () => import('../app/components/password/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'request-reset', loadComponent: () => import('../app/components/password/request-reset/request-reset.component').then(m => m.RequestResetComponent) },

  { path: '', loadComponent: () => import('../app/components/welcome/welcome.component').then(m => m.WelcomeComponent) },




  {
    path: '',
    component: MainLayoutComponent, 
    canActivate: [authGuard],
    children: [
      { path: 'boards', loadComponent: () => import('../app/components/board/board-manegement/board-manegement.component').then(m => m.BoardManegementComponent) },
      { path: 'board-detail/:id', loadComponent: () => import('../app/components/board/board-detail/board-detail.component').then(m => m.BoardDetailComponent) },
      { path: 'profile', loadComponent: () => import('../app/components/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
      { path: 'activities', loadComponent: () => import('../app/components/activity/activities.component').then(m => m.ActivitiesComponent) },
      { path: 'calendar', loadComponent: () => import('../app/components/calendar/calendar.component').then(m => m.CalendarComponent) },

    ]
  }

];
