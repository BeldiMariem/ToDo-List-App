import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserDTO } from '../models/user/user-dto.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  
  getUsers() {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users/getUsers`);
  }
  
  getUserById(userId: number) {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users/getUserById/${userId}`);
  }

}