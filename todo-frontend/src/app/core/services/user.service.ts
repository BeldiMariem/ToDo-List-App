import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthState } from '../models/auth/auth-state.model';
import { JwtResponse } from '../models/auth/jwt-response.model';
import { LoginRequest } from '../models/auth/login-request.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { UserDTO } from '../models/user/user-dto.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  getUsers() {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users/getUsers`);
  }
  
  getUserById(userId: number) {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users/getUserById/${userId}`);
  }

}