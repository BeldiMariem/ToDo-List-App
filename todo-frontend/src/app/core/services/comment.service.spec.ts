import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { CommentService } from './comment.service';
import { UserDTO } from '../models/user/user-dto.model';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { CommentDTO } from '../models/comment.model';

const mockUser: UserDTO = { 
  id: 1, 
  username: 'testuser', 
  email: 'test@test.com' 
};

const mockComment: CommentDTO = { 
  id: 1, 
  content: 'Test comment content', 
  cardId: 1,
  user: mockUser,
  createdAt: '2023-01-01T00:00:00.000Z'
};

const mockComments: CommentDTO[] = [mockComment];

describe('CommentService', () => {
  let service: CommentService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        CommentService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(CommentService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getComments()', () => {
    it('should make GET request with card ID', () => {
      const cardId = 1;
      httpClientSpy.get.and.returnValue(of(mockComments));
      
      service.getComments(cardId).subscribe(comments => {
        expect(comments).toEqual(mockComments);
      });
      
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/comments/getCommentsByCard/${cardId}`
      );
    });

    it('should handle error when getting comments', () => {
      const cardId = 1;
      const errorResponse = { error: { message: 'Comments not found' } };
      httpClientSpy.get.and.returnValue(throwError(() => errorResponse));
      
      service.getComments(cardId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('createComment()', () => {
    it('should make POST request with comment data', () => {
      const commentData: Partial<CommentDTO> = { 
        content: 'New comment', 
        cardId: 1 
      };
      httpClientSpy.post.and.returnValue(of(mockComment));
      
      service.createComment(commentData).subscribe(comment => {
        expect(comment).toEqual(mockComment);
      });
      
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/comments`,
        commentData
      );
    });

    it('should handle error when creating comment', () => {
      const commentData: Partial<CommentDTO> = { 
        content: 'New comment', 
        cardId: 1 
      };
      const errorResponse = { error: { message: 'Creation failed' } };
      httpClientSpy.post.and.returnValue(throwError(() => errorResponse));
      
      service.createComment(commentData).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('deleteComment()', () => {
    it('should make DELETE request with comment ID', () => {
      const commentId = 1;
      httpClientSpy.delete.and.returnValue(of({}));
      
      service.deleteComment(commentId).subscribe(response => {
        expect(response).toEqual({});
      });
      
      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/comments/deleteComment/${commentId}`
      );
    });

    it('should handle error when deleting comment', () => {
      const commentId = 1;
      const errorResponse = { error: { message: 'Deletion failed' } };
      httpClientSpy.delete.and.returnValue(throwError(() => errorResponse));
      
      service.deleteComment(commentId).subscribe({
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });
    });
  });

  describe('CommentDTO interface', () => {
    it('should have correct properties', () => {
      const comment: CommentDTO = {
        id: 1,
        content: 'Test comment content',
        cardId: 1,
        user: mockUser,
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      expect(comment.id).toBe(1);
      expect(comment.content).toBe('Test comment content');
      expect(comment.cardId).toBe(1);
      expect(comment.user.id).toBe(1);
      expect(comment.user.username).toBe('testuser');
      expect(comment.createdAt).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('Endpoint consistency', () => {
  it('should use consistent endpoint patterns', () => {
    httpClientSpy.get.and.returnValue(of(mockComments));
    httpClientSpy.post.and.returnValue(of(mockComment));
    httpClientSpy.delete.and.returnValue(of({}));
    
    const cardId = 1;
    const commentId = 1;
    
    service.getComments(cardId).subscribe();
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/comments/getCommentsByCard/${cardId}`
    );

    service.deleteComment(commentId).subscribe();
    expect(httpClientSpy.delete).toHaveBeenCalledWith(
      `${environment.apiUrl}/comments/deleteComment/${commentId}`
    );

    const commentData: Partial<CommentDTO> = { content: 'Test', cardId: 1 };
    service.createComment(commentData).subscribe();
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/comments`,
      commentData
    );
  });
});

});