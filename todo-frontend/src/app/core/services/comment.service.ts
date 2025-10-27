import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommentDTO } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  getComments(cardId: number) {
    return this.http.get<CommentDTO[]>(`${environment.apiUrl}/comments/getCommentsByCard/${cardId}`);
  }

  createComment(payload: Partial<CommentDTO>) {
    return this.http.post<CommentDTO>(`${environment.apiUrl}/comments/createComment`, payload);
  }

  deleteComment(id: number) {
    return this.http.delete(`${environment.apiUrl}/comments/deleteComment/${id}`);
  }
}
