import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CardDTO } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);

  getCards(listId: number) {
    return this.http.get<CardDTO[]>(`${environment.apiUrl}/lists/${listId}/cards`);
  }

  createCard(payload: Partial<CardDTO>) {
    return this.http.post<CardDTO>(`${environment.apiUrl}/cards`, payload);
  }

  deleteCard(id: number) {
    return this.http.delete(`${environment.apiUrl}/cards/${id}`);
  }
}
