import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BoardManegementComponent } from './board-manegement.component';
import { BoardService } from '../../../core/services/board.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BoardDTO } from '../../../core/models/board.model';
import { UserDTO } from '../../../core/models/user/user-dto.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TitleTruncatePipe } from '../../../core/pipes/title-truncate.pipe';
import { signal } from '@angular/core';

class MockBoardService {
  boards = signal<BoardDTO[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  getBoards = jasmine.createSpy('getBoards').and.returnValue(of([]));
  createBoard = jasmine.createSpy('createBoard').and.returnValue(of({}));
  deleteBoard = jasmine.createSpy('deleteBoard').and.returnValue(of(void 0));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('BoardManegementComponent', () => {
  let component: BoardManegementComponent;
  let fixture: ComponentFixture<BoardManegementComponent>;
  let boardService: MockBoardService;
  let router: MockRouter;

  const mockUser: UserDTO = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser'
  };

  const mockBoards: BoardDTO[] = [
    {
      id: 1,
      name: 'Test Board 1',
      owner: mockUser,
      members: [mockUser]
    },
    {
      id: 2,
      name: 'Test Board 2',
      owner: mockUser,
      members: [mockUser]
    },
    {
      id: 3,
      name: 'Test Board 3',
      owner: mockUser,
      members: [mockUser]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, BoardManegementComponent],
      providers: [
        { provide: BoardService, useClass: MockBoardService },
        { provide: Router, useClass: MockRouter },
        TitleTruncatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardManegementComponent);
    component = fixture.componentInstance;
    
    boardService = TestBed.inject(BoardService) as unknown as MockBoardService;
    router = TestBed.inject(Router) as unknown as MockRouter;

    boardService.boards.set(mockBoards);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call getBoards on ngOnInit', () => {
      component.ngOnInit();
      expect(boardService.getBoards).toHaveBeenCalled();
    });

    it('should initialize progress values when boards are loaded', fakeAsync(() => {
      boardService.boards.set(mockBoards);
      fixture.detectChanges();
      tick();
      
      expect(component.progressValues().length).toBe(mockBoards.length);
      expect(component.progressValues().every(val => val >= 0 && val <= 100)).toBeTrue();
    }));
  });

  describe('View Mode', () => {
    it('should initialize with grid view mode', () => {
      expect(component.viewMode()).toBe('grid');
    });

    it('should change view mode', () => {
      component.viewMode.set('list');
      expect(component.viewMode()).toBe('list');
      
      component.viewMode.set('masonry');
      expect(component.viewMode()).toBe('masonry');
    });
  });

  describe('Board Navigation', () => {
    it('should navigate to board detail', () => {
      const boardId = 1;
      component.openBoard(boardId);
      
      expect(router.navigate).toHaveBeenCalledWith(['/board-detail', boardId]);
    });
  });

  describe('Create Board', () => {
    it('should toggle create modal', () => {
      expect(component.showCreateModal()).toBeFalse();
      
      component.toggleCreateModal();
      expect(component.showCreateModal()).toBeTrue();
      expect(component.newBoardName()).toBe('');
      
      component.toggleCreateModal();
      expect(component.showCreateModal()).toBeFalse();
    });

    it('should create board with valid name', fakeAsync(() => {
      const boardName = 'New Test Board';
      component.newBoardName.set(boardName);
      
      component.createBoard();
      tick();
      
      expect(boardService.createBoard).toHaveBeenCalledWith({ name: boardName });
      expect(boardService.getBoards).toHaveBeenCalled();
      expect(component.newBoardName()).toBe('');
      expect(component.showCreateModal()).toBeFalse();
      expect(component.isCreating()).toBeFalse();
    }));

    it('should not create board with empty name', () => {
      component.newBoardName.set('');
      
      component.createBoard();
      
      expect(boardService.createBoard).not.toHaveBeenCalled();
    });

    it('should not create board with whitespace-only name', () => {
      component.newBoardName.set('   ');
      
      component.createBoard();
      
      expect(boardService.createBoard).not.toHaveBeenCalled();
    });

    it('should handle create board error', fakeAsync(() => {
      const boardName = 'New Test Board';
      component.newBoardName.set(boardName);
      
      boardService.createBoard.and.returnValue(throwError(() => new Error('Creation failed')));
      spyOn(console, 'error');
      
      component.createBoard();
      tick();
      
      expect(console.error).toHaveBeenCalled();
      expect(component.isCreating()).toBeFalse();
    }));

    it('should set isCreating during board creation', fakeAsync(() => {
      const boardName = 'New Test Board';
      component.newBoardName.set(boardName);
      
      boardService.createBoard.and.returnValue(of({}).pipe(delay(100)));
      
      component.createBoard();
      
      expect(component.isCreating()).toBeTrue();
      
      tick(100);
      expect(component.isCreating()).toBeFalse();
    }));
  });

  describe('Delete Board', () => {
    it('should open delete modal', () => {
      const boardToDelete = mockBoards[0];
      
      component.openDeleteModal(boardToDelete);
      
      expect(component.boardToDelete()).toBe(boardToDelete);
      expect(component.showDeleteModal()).toBeTrue();
    });

    it('should close delete modal', () => {
      component.openDeleteModal(mockBoards[0]);
      expect(component.showDeleteModal()).toBeTrue();
      
      component.closeDeleteModal();
      
      expect(component.showDeleteModal()).toBeFalse();
      expect(component.boardToDelete()).toBeNull();
    });

    it('should delete board when confirmed', fakeAsync(() => {
      const boardToDelete = mockBoards[0];
      component.boardToDelete.set(boardToDelete);
      
      component.deleteBoard();
      tick();
      
      expect(boardService.deleteBoard).toHaveBeenCalledWith(boardToDelete.id);
      expect(boardService.getBoards).toHaveBeenCalled();
      expect(component.showDeleteModal()).toBeFalse();
      expect(component.boardToDelete()).toBeNull();
      expect(component.isDeleting()).toBeFalse();
    }));

    it('should not delete board when no board is selected', () => {
      component.boardToDelete.set(null);
      
      component.deleteBoard();
      
      expect(boardService.deleteBoard).not.toHaveBeenCalled();
    });

    it('should handle delete board error', fakeAsync(() => {
      const boardToDelete = mockBoards[0];
      component.boardToDelete.set(boardToDelete);
      
      boardService.deleteBoard.and.returnValue(throwError(() => new Error('Deletion failed')));
      spyOn(console, 'error');
      
      component.deleteBoard();
      tick();
      
      expect(console.error).toHaveBeenCalled();
      expect(component.isDeleting()).toBeFalse();
    }));

    it('should set isDeleting during board deletion', fakeAsync(() => {
      const boardToDelete = mockBoards[0];
      component.boardToDelete.set(boardToDelete);
      
      boardService.deleteBoard.and.returnValue(of(void 0).pipe(delay(100)));
      
      component.deleteBoard();
      
      expect(component.isDeleting()).toBeTrue();
      
      tick(100);
      expect(component.isDeleting()).toBeFalse();
    }));
  });

  describe('Utility Methods', () => {
    it('should get board gradient based on index', () => {
      const gradient1 = component.getBoardGradient(0);
      const gradient2 = component.getBoardGradient(1);
      
      expect(gradient1).toBeDefined();
      expect(gradient2).toBeDefined();
      expect(gradient1).toContain('linear-gradient');
    });

    it('should get stable progress value based on board ID', () => {
      const progress1 = component.getStableProgress(1);
      const progress2 = component.getStableProgress(2);
      
      expect(progress1).toBeGreaterThanOrEqual(30);
      expect(progress1).toBeLessThanOrEqual(95);
      expect(progress2).toBeGreaterThanOrEqual(30);
      expect(progress2).toBeLessThanOrEqual(95);
      expect(progress1).not.toBe(progress2);
    });

    it('should return consistent progress values for same board ID', () => {
      const progress1 = component.getStableProgress(5);
      const progress2 = component.getStableProgress(5);
      
      expect(progress1).toBe(progress2);
    });
  });

  describe('Signal Properties', () => {
    it('should reflect board service loading state', () => {
      boardService.loading.set(true);
      expect(component.loading()).toBeTrue();
      
      boardService.loading.set(false);
      expect(component.loading()).toBeFalse();
    });

    it('should reflect board service error state', () => {
      const errorMessage = 'Test error';
      boardService.error.set(errorMessage);
      expect(component.error()).toBe(errorMessage);
      
      boardService.error.set(null);
      expect(component.error()).toBeNull();
    });

    it('should reflect board service boards state', () => {
      expect(component.boards()).toEqual(mockBoards);
      
      const newBoards: BoardDTO[] = [];
      boardService.boards.set(newBoards);
      expect(component.boards()).toEqual(newBoards);
    });
  });


  afterEach(() => {
    fixture.destroy();
  });
});

import { delay } from 'rxjs/operators';