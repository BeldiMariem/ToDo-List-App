import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'welcome', loadComponent: () => import('../app/pages/welcome/welcome.component').then(m => m.WelcomeComponent) },

  { path: 'login', loadComponent: () => import('../app/pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../app/pages/register/register.component').then(m => m.RegisterComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: '**', redirectTo: 'welcome' }
];