import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserDTO } from '../models/user/user-dto.model';
import { PasswordUpdateDTO } from '../models/password-update.model';
import { UserDeleteRequestDTO } from '../models/user-delete-request.model';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  
  getUsers() {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users/getUsers`);
  }
  
  getUserById(userId: number) {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users/getUserById/${userId}`);
  }
  updateProfile(payload: Partial<UserDTO>) {
    return this.http.put<UserDTO>(`${environment.apiUrl}/users/updateProfile`, payload)
      .pipe(
        catchError((error) => {
          const errorMessage = 'Username or email already exists. Please choose different values.';
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  updatePassword(payload: Partial<PasswordUpdateDTO>) {
      return this.http.put<UserDTO>(`${environment.apiUrl}/users/updatePassword`, payload);
  }
  
  deleteUser(payload: Partial<UserDeleteRequestDTO>) {
      return this.http.put<UserDeleteRequestDTO>(`${environment.apiUrl}/users/deleteUser`, payload);
  }
  deleteGoogleUser() {
      return this.http.delete<UserDeleteRequestDTO>(`${environment.apiUrl}/users/deleteGoogleUser`);
  }

}





