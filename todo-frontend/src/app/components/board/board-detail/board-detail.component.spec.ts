import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BoardDetailComponent } from './board-detail.component';
import { BoardService } from '../../../core/services/board.service';
import { ListService } from '../../../core/services/list.service';
import { CardService } from '../../../core/services/card.service';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, forkJoin } from 'rxjs';
import { BoardDTO } from '../../../core/models/board.model';
import { ListDTO } from '../../../core/models/list.model';
import { CardDTO } from '../../../core/models/card.model';
import { CommentDTO } from '../../../core/models/comment.model';
import { UserDTO } from '../../../core/models/user/user-dto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TitleTruncatePipe } from '../../../core/pipes/title-truncate.pipe';
import { ChangeDetectorRef } from '@angular/core';

class MockBoardService {
  getBoard = jasmine.createSpy('getBoard').and.returnValue(of({}));
  updateBoard = jasmine.createSpy('updateBoard').and.returnValue(of({}));
}

class MockListService {
  getLists = jasmine.createSpy('getLists').and.returnValue(of([]));
  createList = jasmine.createSpy('createList').and.returnValue(of({}));
  updateList = jasmine.createSpy('updateList').and.returnValue(of({}));
  deleteList = jasmine.createSpy('deleteList').and.returnValue(of({}));
}

class MockCardService {
  getCards = jasmine.createSpy('getCards').and.returnValue(of([]));
  createCard = jasmine.createSpy('createCard').and.returnValue(of({}));
  updateCard = jasmine.createSpy('updateCard').and.returnValue(of({}));
  deleteCard = jasmine.createSpy('deleteCard').and.returnValue(of({}));
}

class MockCommentService {
  getComments = jasmine.createSpy('getComments').and.returnValue(of([]));
  createComment = jasmine.createSpy('createComment').and.returnValue(of({}));
  deleteComment = jasmine.createSpy('deleteComment').and.returnValue(of({}));
}

class MockAuthService {
  getCurrentUser = jasmine.createSpy('getCurrentUser').and.returnValue(null);
}

class MockUserService {
  getUsers = jasmine.createSpy('getUsers').and.returnValue(of([]));
  getUserById = jasmine.createSpy('getUserById').and.returnValue(of({}));
}

class MockActivatedRoute {
  snapshot = {
    paramMap: {
      get: jasmine.createSpy('get').and.returnValue('1')
    }
  };
}

class MockChangeDetectorRef {
  detectChanges = jasmine.createSpy('detectChanges');
}

describe('BoardDetailComponent', () => {
  let component: BoardDetailComponent;
  let fixture: ComponentFixture<BoardDetailComponent>;
  let boardService: MockBoardService;
  let listService: MockListService;
  let cardService: MockCardService;
  let commentService: MockCommentService;
  let authService: MockAuthService;
  let userService: MockUserService;
  let activatedRoute: MockActivatedRoute;
  let changeDetectorRef: MockChangeDetectorRef;

  const mockUser: UserDTO = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser'
  };

  const mockUser2: UserDTO = {
    id: 2,
    email: 'user2@example.com',
    username: 'user2'
  };

  const mockBoard: BoardDTO = {
    id: 1,
    name: 'Test Board',
    owner: mockUser,
    members: [mockUser, mockUser2] 
  };

  const mockLists: ListDTO[] = [
    { id: 1, name: 'To Do', color: '#4F46E5', boardId: 1 },
    { id: 2, name: 'In Progress', color: '#F59E0B', boardId: 1 }
  ];

  const mockCards: CardDTO[] = [
    { id: 1, title: 'Task 1', tag: 'tag 1', description: 'Description 1', listId: 1, members: [] },
    { id: 2, title: 'Task 2', tag: 'tag 2', description: 'Description 2', listId: 1, members: [] }
  ];

  const mockComments: CommentDTO[] = [
    { id: 1, content: 'Comment 1', cardId: 1, user: mockUser, createdAt: new Date().toISOString() }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, DragDropModule, BoardDetailComponent],
      providers: [
        { provide: BoardService, useClass: MockBoardService },
        { provide: ListService, useClass: MockListService },
        { provide: CardService, useClass: MockCardService },
        { provide: CommentService, useClass: MockCommentService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef },
        TitleTruncatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardDetailComponent);
    component = fixture.componentInstance;
    
    boardService = TestBed.inject(BoardService) as unknown as MockBoardService;
    listService = TestBed.inject(ListService) as unknown as MockListService;
    cardService = TestBed.inject(CardService) as unknown as MockCardService;
    commentService = TestBed.inject(CommentService) as unknown as MockCommentService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    activatedRoute = TestBed.inject(ActivatedRoute) as unknown as MockActivatedRoute;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef) as unknown as MockChangeDetectorRef;

    authService.getCurrentUser.and.returnValue(mockUser);
    boardService.getBoard.and.returnValue(of(mockBoard));
    listService.getLists.and.returnValue(of(mockLists));
    cardService.getCards.and.returnValue(of(mockCards));
    commentService.getComments.and.returnValue(of(mockComments));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load current user on init', () => {
      component.ngOnInit();
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toEqual(mockUser);
    });

    it('should extract board ID from route', () => {
      component.ngOnInit();
      expect(activatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(component.boardId).toBe(1);
    });

    it('should load board data on init', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(boardService.getBoard).toHaveBeenCalledWith(1);
      expect(component.board).toEqual(mockBoard);
    }));

    it('should handle board loading error', fakeAsync(() => {
      boardService.getBoard.and.returnValue(throwError(() => new Error('Board not found')));
      spyOn(console, 'error');
      
      component.ngOnInit();
      tick();
      
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('Board Data Loading', () => {
    it('should load lists after loading board', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(listService.getLists).toHaveBeenCalledWith(1);
    }));

    it('should load cards for each list', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(cardService.getCards).toHaveBeenCalledWith(1);
      expect(cardService.getCards).toHaveBeenCalledWith(2);
    }));

    it('should load comments for each card', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(commentService.getComments).toHaveBeenCalledWith(1);
      expect(commentService.getComments).toHaveBeenCalledWith(2);
    }));
  });

  describe('Member Management', () => {
    it('should load user details for board members', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component.boardMembersWithDetails).toBeDefined();
    }));

    it('should open add member modal', () => {
      component.openAddMemberModal();
      
      expect(component.showAddMemberModal).toBeTrue();
      expect(component.selectedUsers).toEqual([]);
      expect(component.userSearchQuery).toBe('');
      expect(component.errorMessage).toBe('');
    });

    it('should close add member modal', () => {
      component.openAddMemberModal();
      component.closeAddMemberModal();
      
      expect(component.showAddMemberModal).toBeFalse();
      expect(component.selectedUsers).toEqual([]);
      expect(component.userSearchQuery).toBe('');
    });

    it('should load available users for adding', fakeAsync(() => {
      const availableUsers: UserDTO[] = [
        { id: 3, email: 'user3@example.com', username: 'user3' },
        { id: 4, email: 'user4@example.com', username: 'user4' }
      ];
      userService.getUsers.and.returnValue(of(availableUsers));
      
      component.openAddMemberModal();
      component.loadAvailableUsers();
      tick();
      
      expect(userService.getUsers).toHaveBeenCalled();
      expect(component.availableUsers).toEqual(availableUsers);
    }));

    it('should filter out existing members from available users', () => {
      // Set up current board members
      component.boardMembersWithDetails = [
        { userId: 1, role: 'OWNER', email: 'test@example.com', username: 'testuser' },
        { userId: 2, role: 'MEMBER', email: 'user2@example.com', username: 'user2' }
      ];
      
      const allUsers: UserDTO[] = [
        { id: 1, email: 'test@example.com', username: 'testuser' },
        { id: 2, email: 'user2@example.com', username: 'user2' },
        { id: 3, email: 'user3@example.com', username: 'user3' }
      ];
      
      const filtered = component['filterOutExistingMembers'](allUsers);
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(3);
    });

    it('should toggle user selection', () => {
      const user: UserDTO = { id: 1, email: 'test@example.com', username: 'testuser' };
      
      component.toggleUserSelection(user);
      expect(component.isUserSelected(user.id!)).toBeTrue();
      
      component.toggleUserSelection(user);
      expect(component.isUserSelected(user.id!)).toBeFalse();
    });

    it('should add members to board', fakeAsync(() => {
      const selectedUsers: UserDTO[] = [
        { id: 3, email: 'user3@example.com', username: 'user3' }
      ];
      
      component.selectedUsers = selectedUsers;
      component.board = mockBoard;
      
      component.addMembersToBoard();
      tick();
      
      const expectedPayload: any = {
        boardId: mockBoard.id,
        userIds: [3],
        role: 'MEMBER'
      };
      
      expect(boardService.updateBoard).toHaveBeenCalledWith(expectedPayload);
    }));
  });

  describe('List Operations', () => {
    it('should add new list', fakeAsync(() => {
      component.newListName = 'New List';
      component.newListColor = '#4F46E5';
      component.boardId = 1;
      
      const newList: ListDTO = { id: 3, name: 'New List', color: '#4F46E5', boardId: 1 };
      listService.createList.and.returnValue(of(newList));
      
      component.addList();
      tick();
      
      expect(listService.createList).toHaveBeenCalledWith({
        name: 'New List',
        color: '#4F46E5',
        boardId: 1
      });
    }));

    it('should not add list with empty name', () => {
      component.newListName = '';
      
      component.addList();
      
      expect(listService.createList).not.toHaveBeenCalled();
    });

    it('should cancel adding list', () => {
      component.newListName = 'Test List';
      component.newListColor = '#FF0000';
      component.showAddListForm = true;
      
      component.cancelAddList();
      
      expect(component.newListName).toBe('');
      expect(component.newListColor).toBe('#4F46E5');
      expect(component.showAddListForm).toBeFalse();
    });
  });

  describe('Card Operations', () => {
    it('should add card to list', fakeAsync(() => {
      const payload = { listId: 1, title: 'New Card', tag: 'tag', description: 'Description' };
      const newCard: CardDTO = { id: 3, ...payload, members: [] };
      
      cardService.createCard.and.returnValue(of(newCard));
      
      component.onAddCard(payload);
      tick();
      
      expect(cardService.createCard).toHaveBeenCalledWith({
        title: 'New Card',
        tag: 'tag',
        description: 'Description',
        listId: 1,
        members: []
      });
    }));

    it('should not add card with empty title', () => {
      const payload = { listId: 1, title: '',tag: 'tag', description: 'Description' };
      
      component.onAddCard(payload);
      
      expect(cardService.createCard).not.toHaveBeenCalled();
    });

    it('should delete card', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.onDeleteCard(1, 1);
      tick();
      
      expect(cardService.deleteCard).toHaveBeenCalledWith(1);
    }));

    it('should not delete card if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.onDeleteCard(1, 1);
      
      expect(cardService.deleteCard).not.toHaveBeenCalled();
    });
  });

  describe('Comment Operations', () => {

    it('should not add empty comment', () => {
      const mockCard = { id: 1, newComment: '', comments: [] };
      const event = { card: mockCard, listId: 1 };
      
      component.onAddComment(event);
      
      expect(commentService.createComment).not.toHaveBeenCalled();
    });

    it('should delete comment', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      
      const event = { commentId: 1, card: { id: 1 }, listId: 1 };
      
      component.onDeleteCardComment(event);
      tick();
      
      expect(commentService.deleteComment).toHaveBeenCalledWith(1);
    }));
  });

  describe('Utility Methods', () => {
    it('should get user initials', () => {
      const initials = component.getUserInitials('test@example.com');
      expect(initials).toBe('TE');
    });

    it('should get total tasks count', () => {
      component.lists = [
        { id: 1, name: 'List 1', color: '#000', boardId: 1, cards: [{ id: 1, title: 'Card 1',tag: 'tag 1', listId: 1, members: [] }] } as any,
        { id: 2, name: 'List 2', color: '#000', boardId: 1, cards: [{ id: 2, title: 'Card 2',tag: 'tag 2', listId: 2, members: [] }] } as any
      ];
      
      const total = component.getTotalTasks();
      expect(total).toBe(2);
    });

    it('should toggle comments visibility', () => {
      component.onToggleCardComments(1);
      expect(component.isCommentsOpen(1)).toBeTrue();
      
      component.onToggleCardComments(1);
      expect(component.isCommentsOpen(1)).toBeFalse();
    });
  });

  describe('View Mode', () => {
    it('should set view mode and save to localStorage', () => {
      spyOn(localStorage, 'setItem');
      
      component.setViewMode('list');
      expect(component.viewMode).toBe('list');
      expect(localStorage.setItem).toHaveBeenCalledWith('boardViewMode', 'list');
      
      component.setViewMode('grid');
      expect(component.viewMode).toBe('grid');
      expect(localStorage.setItem).toHaveBeenCalledWith('boardViewMode', 'grid');
    });

    it('should load view mode from localStorage on init', () => {
      spyOn(localStorage, 'getItem').and.returnValue('list');
      
      component.ngOnInit();
      expect(component.viewMode).toBe('list');
    });

    it('should use default grid view if no saved view mode', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      
      component.ngOnInit();
      expect(component.viewMode).toBe('grid');
    });
  });

  describe('Member Display', () => {
    beforeEach(() => {
      component.boardMembersWithDetails = [
        { userId: 1, role: 'OWNER', email: 'user1@example.com', username: 'user1' },
        { userId: 2, role: 'MEMBER', email: 'user2@example.com', username: 'user2' },
        { userId: 3, role: 'MEMBER', email: 'user3@example.com', username: 'user3' },
        { userId: 4, role: 'MEMBER', email: 'user4@example.com', username: 'user4' },
        { userId: 5, role: 'MEMBER', email: 'user5@example.com', username: 'user5' }
      ];
    });

    it('should get visible members', () => {
      component.isMembersExpanded = false;
      const visible = component.getVisibleMembers();
      expect(visible.length).toBe(4); 
      
      component.isMembersExpanded = true;
      const allVisible = component.getVisibleMembers();
      expect(allVisible.length).toBe(5);
    });

    it('should check for hidden members', () => {
      expect(component.hasHiddenMembers()).toBeTrue();
      
      component.boardMembersWithDetails = component.boardMembersWithDetails.slice(0, 3);
      expect(component.hasHiddenMembers()).toBeFalse();
    });

    it('should get hidden members count', () => {
      expect(component.getHiddenMembersCount()).toBe(1);
    });

    it('should toggle member expansion', () => {
      expect(component.isMembersExpanded).toBeFalse();
      
      component.toggleMemberExpansion();
      expect(component.isMembersExpanded).toBeTrue();
      
      component.toggleMemberExpansion();
      expect(component.isMembersExpanded).toBeFalse();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});