import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ListDTO } from '../models/list.model';

@Injectable({ providedIn: 'root' })
export class ListService {
  private http = inject(HttpClient);

  getLists(boardId: number) {
    return this.http.get<ListDTO[]>(`${environment.apiUrl}/lists/getListsByBoard/${boardId}`);
  }

  createList(payload: Partial<ListDTO>) {
    return this.http.post<ListDTO>(`${environment.apiUrl}/lists/createList`, payload);
  }

  deleteList(id: number) {
    return this.http.delete(`${environment.apiUrl}/lists/deleteList/${id}`);
  }
  
  updateList(payload: Partial<ListDTO>) {
    return this.http.put<ListDTO>(`${environment.apiUrl}/lists/updateList`, payload);
  }
}
