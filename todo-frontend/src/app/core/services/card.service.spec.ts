import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { CardService } from './card.service';
import { UserDTO } from '../models/user/user-dto.model';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { CardDTO } from '../models/card.model';

const mockUser: UserDTO = { 
  id: 1, 
  username: 'testuser', 
  email: 'test@test.com' 
};

const mockCard: CardDTO = { 
  id: 1, 
  title: 'Test Card', 
  description: 'Test Description',
  listId: 1,
  members: [mockUser]
};

const mockCards: CardDTO[] = [mockCard];

describe('CardService', () => {
  let service: CardService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        CardService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(CardService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCards()', () => {
    it('should make GET request with list ID', () => {
      const listId = 1;
      httpClientSpy.get.and.returnValue(of(mockCards));
      
      service.getCards(listId).subscribe(cards => {
        expect(cards).toEqual(mockCards);
      });
      
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/cards/getCardsByList/${listId}`
      );
    });

    it('should handle error when getting cards', () => {
      const listId = 1;
      const errorResponse = { error: { message: 'Cards not found' } };
      httpClientSpy.get.and.returnValue(throwError(() => errorResponse));
      
      service.getCards(listId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('createCard()', () => {
    it('should make POST request with card data', () => {
      const cardData: Partial<CardDTO> = { 
        title: 'New Card', 
        description: 'New Description',
        listId: 1 
      };
      httpClientSpy.post.and.returnValue(of(mockCard));
      
      service.createCard(cardData).subscribe(card => {
        expect(card).toEqual(mockCard);
      });
      
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/cards/createCard`,
        cardData
      );
    });

    it('should handle error when creating card', () => {
      const cardData: Partial<CardDTO> = { 
        title: 'New Card', 
        description: 'New Description',
        listId: 1 
      };
      const errorResponse = { error: { message: 'Creation failed' } };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
      
      service.createCard(cardData).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('updateCard()', () => {
    it('should make PUT request with card ID and update data', () => {
      const cardId = 1;
      const updateData: Partial<CardDTO> = { 
        title: 'Updated Card', 
        description: 'Updated Description' 
      };
      httpClientSpy.put.and.returnValue(of(mockCard));
      
      service.updateCard(cardId, updateData).subscribe(card => {
        expect(card).toEqual(mockCard);
      });
      
      expect(httpClientSpy.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/cards/updateCard/${cardId}`,
        updateData
      );
    });

    it('should handle error when updating card', () => {
      const cardId = 1;
      const updateData: Partial<CardDTO> = { 
        title: 'Updated Card', 
        description: 'Updated Description' 
      };
      const errorResponse = { error: { message: 'Update failed' } };
      httpClientSpy.put.and.returnValue(throwError(() => errorResponse));
      
      service.updateCard(cardId, updateData).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('deleteCard()', () => {
    it('should make DELETE request with card ID', () => {
      const cardId = 1;
      httpClientSpy.delete.and.returnValue(of({}));
      
      service.deleteCard(cardId).subscribe(response => {
        expect(response).toEqual({});
      });
      
      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/cards/deleteCard/${cardId}`
      );
    });

    it('should handle error when deleting card', () => {
      const cardId = 1;
      const errorResponse = { error: { message: 'Deletion failed' } };
      httpClientSpy.delete.and.returnValue(throwError(() => errorResponse));
      
      service.deleteCard(cardId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('CardDTO interface', () => {
    it('should have correct properties', () => {
      const card: CardDTO = {
        id: 1,
        title: 'Test Card',
        description: 'Test Description',
        listId: 1,
        members: [mockUser]
      };
      
      expect(card.id).toBeDefined();
      expect(card.title).toBeDefined();
      expect(card.description).toBeDefined();
      expect(card.listId).toBeDefined();
      expect(card.members).toBeDefined();
      expect(card.members[0].id).toBe(1);
      expect(card.members[0].username).toBe('testuser');
    });
  });

  describe('UserDTO interface in CardDTO', () => {
    it('should support optional email property', () => {
      const cardWithOptionalEmail: CardDTO = {
        id: 1,
        title: 'Test Card',
        description: 'Test Description',
        listId: 1,
        members: [{ id: 1, username: 'testuser' }] // email is optional
      };
      
      expect(cardWithOptionalEmail.members[0].email).toBeUndefined();
      expect(cardWithOptionalEmail.members[0].username).toBe('testuser');
    });

    it('should support email property when provided', () => {
      const cardWithEmail: CardDTO = {
        id: 1,
        title: 'Test Card',
        description: 'Test Description',
        listId: 1,
        members: [mockUser] // email is provided
      };
      
      expect(cardWithEmail.members[0].email).toBe('test@test.com');
    });
  });
});