import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { BoardService } from './board.service';
import { BoardDTO } from '../models/board.model';
import { UserDTO } from '../models/user/user-dto.model';
import { environment } from '../../../environments/environment';
import { of, Subject, throwError } from 'rxjs';
import { BoardUpdateDTO } from '../models/board-update.model';

const mockUser: UserDTO = { id: 1, username: 'testuser', email: 'test@test.com' };
const mockBoard: BoardDTO = { 
  id: 1, 
  name: 'Test Board', 
  owner: mockUser,
  members: [mockUser]
};

const mockBoards: BoardDTO[] = [mockBoard];
const mockBoardUpdate: BoardUpdateDTO = { 
  boardId: 1, 
  newName: 'Updated Board', 
  userIds: [1, 2], 
  role: 'member' 
};


describe('BoardService', () => {
    let service: BoardService;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;

    beforeEach(() => {
        const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

        TestBed.configureTestingModule({
            providers: [
                BoardService,
                { provide: HttpClient, useValue: httpSpy }
            ]
        });
        service = TestBed.inject(BoardService);
        httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
        spyOn(localStorage, 'getItem').and.returnValue(null);
        spyOn(localStorage, 'setItem').and.stub();
        spyOn(localStorage, 'removeItem').and.stub();
    });

    afterEach(() => {
        service['_boards'].set([]);
        service['_loading'].set(false);
        service['_error'].set(null);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getBoards()', () => {
        it('should set loading to true when called', () => {
            const responseSubject = new Subject<BoardDTO[]>();
            httpClientSpy.get.and.returnValue(responseSubject.asObservable());

            service.getBoards();

            expect(service.loading()).toBeTrue();

            responseSubject.complete();
        });

        it('should make GET request to fetch boards', () => {
            httpClientSpy.get.and.returnValue(of(mockBoards));

            service.getBoards();

            expect(httpClientSpy.get).toHaveBeenCalledWith(
                `${environment.apiUrl}/boards/getBoardByUser`
            );
        });

        it('should update boards and set loading to false on success', (done) => {
            httpClientSpy.get.and.returnValue(of(mockBoards));

            service.getBoards();

            setTimeout(() => {
                expect(service.boards()).toEqual(mockBoards);
                expect(service.loading()).toBeFalse();
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should set error and set loading to false on failure', (done) => {
            const errorResponse = { error: { message: 'Server error' } };
            httpClientSpy.get.and.returnValue(throwError(() => errorResponse));

            service.getBoards();

            setTimeout(() => {
                expect(service.boards()).toEqual([]);
                expect(service.loading()).toBeFalse();
                expect(service.error()).toBe('Server error');
                done();
            }, 0);
        });

        it('should handle error without message', (done) => {
            const errorResponse = { error: null };
            httpClientSpy.get.and.returnValue(throwError(() => errorResponse));

            service.getBoards();

            setTimeout(() => {
                expect(service.error()).toBe('Failed to fetch boards');
                done();
            }, 0);
        });
    });
    describe('getBoard()', () => {
        it('should make GET request with board ID', () => {
            const boardId = 1;
            httpClientSpy.get.and.returnValue(of(mockBoard));

            service.getBoard(boardId).subscribe(board => {
                expect(board).toEqual(mockBoard);
            });

            expect(httpClientSpy.get).toHaveBeenCalledWith(
                `${environment.apiUrl}/boards/getBoard/${boardId}`
            );
        });

        it('should handle error when getting board', () => {
            const boardId = 1;
            const errorResponse = { error: { message: 'Board not found' } };
            httpClientSpy.get.and.returnValue(throwError(() => errorResponse));

            service.getBoard(boardId).subscribe({
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                }
            });
        });
    });


    describe('createBoard()', () => {
        it('should make POST request with board data', () => {
            const boardData: Partial<BoardDTO> = { name: 'New Board' };
            httpClientSpy.post.and.returnValue(of(mockBoard));

            service.createBoard(boardData).subscribe(board => {
                expect(board).toEqual(mockBoard);
            });

            expect(httpClientSpy.post).toHaveBeenCalledWith(
                `${environment.apiUrl}/boards/createBoard`,
                boardData
            );
        });

        it('should handle error when creating board', () => {
            const boardData: Partial<BoardDTO> = { name: 'New Board' };
            const errorResponse = { error: { message: 'Creation failed' } };
            httpClientSpy.post.and.returnValue(throwError(() => errorResponse));

            service.createBoard(boardData).subscribe({
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                }
            });
        });
    });

    describe('deleteBoard()', () => {
        it('should make DELETE request with board ID', () => {
            const boardId = 1;
            httpClientSpy.delete.and.returnValue(of({}));

            service.deleteBoard(boardId).subscribe(response => {
                expect(response).toEqual({});
            });

            expect(httpClientSpy.delete).toHaveBeenCalledWith(
                `${environment.apiUrl}/boards/deleteBoard/${boardId}`
            );
        });

        it('should handle error when deleting board', () => {
            const boardId = 1;
            const errorResponse = { error: { message: 'Deletion failed' } };
            httpClientSpy.delete.and.returnValue(throwError(() => errorResponse));

            service.deleteBoard(boardId).subscribe({
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                }
            });
        });
    });

    describe('updateBoard()', () => {
        it('should make PUT request with board update data', () => {
            httpClientSpy.put.and.returnValue(of(mockBoardUpdate));

            service.updateBoard(mockBoardUpdate).subscribe(board => {
                expect(board).toEqual(mockBoardUpdate);
            });

            expect(httpClientSpy.put).toHaveBeenCalledWith(
                `${environment.apiUrl}/boards/updateBoard`,
                mockBoardUpdate
            );
        });

        it('should handle error when updating board', () => {
            const errorResponse = { error: { message: 'Update failed' } };
            httpClientSpy.put.and.returnValue(throwError(() => errorResponse));

            service.updateBoard(mockBoardUpdate).subscribe({
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                }
            });
        });
    });

    describe('state signals', () => {
        it('should provide boards signal', () => {
            service['_boards'].set(mockBoards);
            expect(service.boards()).toEqual(mockBoards);
        });

        it('should provide loading signal', () => {
            service['_loading'].set(true);
            expect(service.loading()).toBeTrue();

            service['_loading'].set(false);
            expect(service.loading()).toBeFalse();
        });

        it('should provide error signal', () => {
            service['_error'].set('Test error');
            expect(service.error()).toBe('Test error');

            service['_error'].set(null);
            expect(service.error()).toBeNull();
        });
    });
});