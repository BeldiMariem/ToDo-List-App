import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BoardDTO } from '../models/board.model';
import { BoardUpdateDTO } from '../models/board-update.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private http = inject(HttpClient);

  private _boards = signal<BoardDTO[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly boards = computed(() => this._boards());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  getBoards() {
    this._loading.set(true);
    this.http.get<BoardDTO[]>(`${environment.apiUrl}/boards/getBoardByUser`).subscribe({
      next: (res) => {
        this._boards.set(res);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message || 'Failed to fetch boards');
        this._loading.set(false);
      },
    });
  }
  getBoard(id: number) {
    return this.http.get<BoardDTO>(`${environment.apiUrl}/boards/getBoard/${id}`);
  }
  createBoard(payload: Partial<BoardDTO>) {
    return this.http.post<BoardDTO>(`${environment.apiUrl}/boards/createBoard`, payload);
  }

  deleteBoard(id: number) {
    return this.http.delete(`${environment.apiUrl}/boards/deleteBoard/${id}`);
  }
  updateBoard(payload: Partial<BoardUpdateDTO>) {
    return this.http.put<BoardUpdateDTO>(`${environment.apiUrl}/boards/updateBoard`, payload);
  }
}
