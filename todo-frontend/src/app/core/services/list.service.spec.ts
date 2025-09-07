import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ListService } from './list.service';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { ListDTO } from '../models/list.model';

const mockList: ListDTO = { 
  id: 1, 
  name: 'Test List', 
  color: '#FF0000',
  boardId: 1
};

const mockLists: ListDTO[] = [mockList];

describe('ListService', () => {
  let service: ListService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        ListService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(ListService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLists()', () => {
    it('should make GET request with board ID', () => {
      const boardId = 1;
      httpClientSpy.get.and.returnValue(of(mockLists));
      
      service.getLists(boardId).subscribe(lists => {
        expect(lists).toEqual(mockLists);
      });
      
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/lists/getListsByBoard/${boardId}`
      );
    });

    it('should handle error when getting lists', () => {
      const boardId = 1;
      const errorResponse = { error: { message: 'Lists not found' } };
      httpClientSpy.get.and.returnValue(throwError(() => errorResponse));
      
      service.getLists(boardId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('createList()', () => {
    it('should make POST request with list data', () => {
      const listData: Partial<ListDTO> = { name: 'New List', boardId: 1, color: '#00FF00' };
      httpClientSpy.post.and.returnValue(of(mockList));
      
      service.createList(listData).subscribe(list => {
        expect(list).toEqual(mockList);
      });
      
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/lists/createList`,
        listData
      );
    });

    it('should handle error when creating list', () => {
      const listData: Partial<ListDTO> = { name: 'New List', boardId: 1, color: '#00FF00' };
      const errorResponse = { error: { message: 'Creation failed' } };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
      
      service.createList(listData).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('deleteList()', () => {
    it('should make DELETE request with list ID', () => {
      const listId = 1;
      httpClientSpy.delete.and.returnValue(of({}));
      
      service.deleteList(listId).subscribe(response => {
        expect(response).toEqual({});
      });
      
      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/lists/deleteList/${listId}`
      );
    });

    it('should handle error when deleting list', () => {
      const listId = 1;
      const errorResponse = { error: { message: 'Deletion failed' } };
      httpClientSpy.delete.and.returnValue(throwError(() => errorResponse));
      
      service.deleteList(listId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('updateList()', () => {
    it('should make PUT request with list update data', () => {
      const updateData: Partial<ListDTO> = { id: 1, name: 'Updated List', color: '#0000FF' };
      httpClientSpy.put.and.returnValue(of(mockList));
      
      service.updateList(updateData).subscribe(list => {
        expect(list).toEqual(mockList);
      });
      
      expect(httpClientSpy.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/lists/updateList`,
        updateData
      );
    });

    it('should handle error when updating list', () => {
      const updateData: Partial<ListDTO> = { id: 1, name: 'Updated List', color: '#0000FF' };
      const errorResponse = { error: { message: 'Update failed' } };
      httpClientSpy.put.and.returnValue(throwError(() => errorResponse));
      
      service.updateList(updateData).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('ListDTO interface', () => {
    it('should have correct properties', () => {
      const list: ListDTO = {
        id: 1,
        name: 'Test List',
        color: '#FF0000',
        boardId: 1
      };
      
      expect(list.id).toBeDefined();
      expect(list.name).toBeDefined();
      expect(list.color).toBeDefined();
      expect(list.boardId).toBeDefined();
    });
  });
});