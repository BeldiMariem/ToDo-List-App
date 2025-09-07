import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { UserDTO } from '../models/user/user-dto.model';
import { PasswordUpdateDTO } from '../models/password-update.model';
import { UserDeleteRequestDTO } from '../models/user-delete-request.model';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';

const mockUser: UserDTO = { id: 1, username: 'testuser', email: 'test@test.com' };
const mockUsers: UserDTO[] = [mockUser];
const mockPasswordUpdate: PasswordUpdateDTO = { oldPassword: 'oldPass', newPassword: 'newPass' };
const mockDeleteRequest: UserDeleteRequestDTO = { password: 'password123' };

describe('UserService', () => {
  let service: UserService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(UserService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers()', () => {
    it('should make GET request to get all users', () => {
      httpClientSpy.get.and.returnValue(of(mockUsers));
      
      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });
      
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/users/getUsers`
      );
    });

    it('should handle error when getting users', () => {
      const errorResponse = { error: { message: 'Server error' } };
      httpClientSpy.get.and.returnValue(throwError(() => errorResponse));
      
      service.getUsers().subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('getUserById()', () => {
    it('should make GET request with user ID', () => {
      const userId = 1;
      httpClientSpy.get.and.returnValue(of(mockUsers));
      
      service.getUserById(userId).subscribe(users => {
        expect(users).toEqual(mockUsers);
      });
      
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/users/getUserById/${userId}`
      );
    });

    it('should handle error when getting user by ID', () => {
      const userId = 1;
      const errorResponse = { error: { message: 'User not found' } };
      httpClientSpy.get.and.returnValue(throwError(() => errorResponse));
      
      service.getUserById(userId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('updateProfile()', () => {
    it('should make PUT request with user data', () => {
      const updateData: Partial<UserDTO> = { username: 'updateduser' };
      httpClientSpy.put.and.returnValue(of(mockUser));
      
      service.updateProfile(updateData).subscribe(user => {
        expect(user).toEqual(mockUser);
      });
      
      expect(httpClientSpy.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/users/updateProfile`,
        updateData
      );
    });

    it('should handle error when updating profile', () => {
      const updateData: Partial<UserDTO> = { username: 'updateduser' };
      const errorResponse = { error: { message: 'Update failed' } };
      httpClientSpy.put.and.returnValue(throwError(() => errorResponse));
      
      service.updateProfile(updateData).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('updatePassword()', () => {
    it('should make PUT request with password data', () => {
      httpClientSpy.put.and.returnValue(of(mockUser));
      
      service.updatePassword(mockPasswordUpdate).subscribe(user => {
        expect(user).toEqual(mockUser);
      });
      
      expect(httpClientSpy.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/users/updatePassword`,
        mockPasswordUpdate
      );
    });

    it('should handle error when updating password', () => {
      const errorResponse = { error: { message: 'Invalid current password' } };
      httpClientSpy.put.and.returnValue(throwError(() => errorResponse));
      
      service.updatePassword(mockPasswordUpdate).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('deleteUser()', () => {
    it('should make PUT request with delete request data', () => {
      httpClientSpy.put.and.returnValue(of(mockDeleteRequest));
      
      service.deleteUser(mockDeleteRequest).subscribe(response => {
        expect(response).toEqual(mockDeleteRequest);
      });
      
      expect(httpClientSpy.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/users/deleteUser`,
        mockDeleteRequest
      );
    });

    it('should handle error when deleting user', () => {
      const errorResponse = { error: { message: 'Deletion failed' } };
      httpClientSpy.put.and.returnValue(throwError(() => errorResponse));
      
      service.deleteUser(mockDeleteRequest).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('deleteGoogleUser()', () => {
    it('should make DELETE request', () => {
      httpClientSpy.delete.and.returnValue(of(mockDeleteRequest));
      
      service.deleteGoogleUser().subscribe(response => {
        expect(response).toEqual(mockDeleteRequest);
      });
      
      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/users/deleteGoogleUser`
      );
    });

    it('should handle error when deleting Google user', () => {
      const errorResponse = { error: { message: 'Deletion failed' } };
      httpClientSpy.delete.and.returnValue(throwError(() => errorResponse));
      
      service.deleteGoogleUser().subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });
});