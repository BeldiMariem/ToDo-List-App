import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../app/layouts/main-layout.component';

export const routes: Routes = [
  { path: 'welcome', loadComponent: () => import('../app/pages/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'login', loadComponent: () => import('../app/pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../app/pages/register/register.component').then(m => m.RegisterComponent) },




  {
    path: '',
    component: MainLayoutComponent, 
    children: [
      { path: 'boards', loadComponent: () => import('../app/pages/board/board-manegement/board-manegement.component').then(m => m.BoardManegementComponent) },
      //{ path: 'board/:id', loadComponent: () => import('../app/pages/board/board.component').then(m => m.BoardComponent) }
    ]
  }

];
