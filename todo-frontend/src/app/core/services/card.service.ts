import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CardDTO } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);

  getCards(listId: number) {
    return this.http.get<CardDTO[]>(`${environment.apiUrl}/cards/getCardsByList/${listId}`);
  }

  createCard(payload: Partial<CardDTO>) {
    return this.http.post<CardDTO>(`${environment.apiUrl}/cards/createCard`, payload);
  }
  updateCard(cardId: number,payload: Partial<CardDTO>) {
    return this.http.put<CardDTO>(`${environment.apiUrl}/cards/updateCard/${cardId}`, payload);
  }

  deleteCard(cardId: number) {
    return this.http.delete(`${environment.apiUrl}/cards/deleteCard/${cardId}`);
  }
}
