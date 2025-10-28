import { Component, OnInit, inject, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';

import { BoardDTO } from '../../../core/models/board.model';
import { ListDTO } from '../../../core/models/list.model';
import { CardDTO } from '../../../core/models/card.model';
import { CommentDTO } from '../../../core/models/comment.model';
import { UserDTO } from '../../../core/models/user/user-dto.model';
import { BoardUpdateDTO } from '../../../core/models/board-update.model';

import { CardService } from '../../../core/services/card.service';
import { ListService } from '../../../core/services/list.service';
import { CommentService } from '../../../core/services/comment.service';
import { BoardService } from '../../../core/services/board.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

import { ListComponent } from '../list/list.component';
import { moveItemInArray, transferArrayItem, CdkDragDrop, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { TitleTruncatePipe } from '../../../core/pipes/title-truncate.pipe';


interface ListWithCards extends ListDTO {
  cards: (CardDTO & { comments: CommentDTO[]; newComment: string })[];
}

interface BoardMemberWithDetails {
  userId: number;
  role: string;
  email: string;
  username: string;
}

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, ListComponent, FormsModule, DragDropModule,TitleTruncatePipe]
})
export class BoardDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private listService = inject(ListService);
  private cardService = inject(CardService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();


  boardMembersWithDetails: BoardMemberWithDetails[] = [];
  boardId!: number;
  board: BoardDTO | null = null;
  lists: ListWithCards[] = [];
  currentUser!: UserDTO;
  userss: UserDTO[] = [];

  newListName = '';
  newListColor = '#4F46E5';
  showAddListForm = false;
  activeListId: number | null = null;
  openCommentCards = new Set<number>();

  showAddMemberModal = false;
  availableUsers: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  selectedUsers: UserDTO[] = [];
  userSearchQuery = '';
  selectedRole = 'MEMBER';
  isAddingMember = false;
  errorMessage = '';

  isTooltipVisible = false;
  tooltipText = '';
  tooltipPosition = { x: 0, y: 0 };
  viewMode: 'grid' | 'list' = 'grid';


  ngOnInit() {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCurrentUser();
    this.loadBoardData();

    const savedViewMode = localStorage.getItem('boardViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode = savedViewMode;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    localStorage.setItem('boardViewMode', mode);
  }

  isGridView(): boolean {
    return this.viewMode === 'grid';
  }

  isListView(): boolean {
    return this.viewMode === 'list';
  }
  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showAddMemberModal) {
      this.closeAddMemberModal();
      event.preventDefault();
    }
  }

  private loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    } else {
      console.error('No current user found');
    }
  }

  private loadBoardData() {
    this.boardService.getBoard(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (board) => {
          this.board = board;
          this.loadLists();

          this.loadUserDetailsForMembers(board.members);
        },
        error: (error) => {
          console.error('Error loading board:', error);
        }
      });
  }

  private loadUserDetailsForMembers(members: any[]) {
    this.boardMembersWithDetails = [];

    if (!members || members.length === 0) return;

    const userObservables = members.map(member =>
      this.userService.getUserById(member.userId)
    );

    forkJoin(userObservables).subscribe({
      next: (response: any) => {
        const users = response as UserDTO[];

        this.boardMembersWithDetails = members.map((member, index) => ({
          ...member,
          email: users[index]?.email || 'unknown@example.com',
          username: users[index]?.username || 'User ' + member.userId
        }));

        if (this.availableUsers.length > 0) {
          this.filteredUsers = this.filterOutExistingMembers(this.availableUsers);
        }

        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.boardMembersWithDetails = members.map(member => ({
          ...member,
          email: 'user' + member.userId + '@example.com',
          username: 'User ' + member.userId
        }));

        if (this.availableUsers.length > 0) {
          this.filteredUsers = this.filterOutExistingMembers(this.availableUsers);
        }

        this.changeDetectorRef.detectChanges();
      }
    });
  }
  openAddMemberModal(): void {
    this.showAddMemberModal = true;
    this.selectedUsers = [];
    this.userSearchQuery = '';
    this.selectedRole = 'MEMBER';
    this.errorMessage = '';
    this.loadAvailableUsers();
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    this.selectedUsers = [];
    this.userSearchQuery = '';
    this.errorMessage = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as Element).classList.contains('modal-backdrop')) {
      this.closeAddMemberModal();
    }
  }

  loadAvailableUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;

        this.filteredUsers = this.filterOutExistingMembers(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
      }
    });
  }

  private filterOutExistingMembers(users: UserDTO[]): UserDTO[] {
    if (!this.boardMembersWithDetails || this.boardMembersWithDetails.length === 0) {
      return users;
    }
    const memberUserIds = this.boardMembersWithDetails.map(member => member.userId);
    return users.filter(user => !memberUserIds.includes(user.id!));
  }

  filterUsers(): void {
    if (!this.userSearchQuery) {
      this.filteredUsers = this.filterOutExistingMembers(this.availableUsers);
      return;
    }

    const query = this.userSearchQuery.toLowerCase();

    const searchedUsers = this.availableUsers.filter(user =>
      user.email!.toLowerCase().includes(query) ||
      (user.username && user.username.toLowerCase().includes(query))
    );

    this.filteredUsers = this.filterOutExistingMembers(searchedUsers);
  }


  toggleUserSelection(user: UserDTO): void {
    const isSelected = this.isUserSelected(user.id);
    if (isSelected) {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    } else {
      this.selectedUsers = [...this.selectedUsers, user];
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUsers.some(user => user.id === userId);
  }

  removeUserFromSelection(user: UserDTO): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
  }

  getUserInitials(email: string): string {
    return email.substring(0, 2).toUpperCase();
  }

  addMembersToBoard(): void {
    if (this.selectedUsers.length === 0 || !this.board) return;

    this.isAddingMember = true;
    this.errorMessage = '';

    const payload: Partial<BoardUpdateDTO> = {
      boardId: this.board.id,
      userIds: this.selectedUsers.map(user => user.id),
      role: this.selectedRole
    };

    this.boardService.updateBoard(payload).subscribe({
      next: () => {
        this.loadBoardData();

        this.isAddingMember = false;
        this.closeAddMemberModal();

        this.loadAvailableUsers();
      },
      error: (error) => {
        console.error('Error adding members:', error);
        this.errorMessage = 'Failed to add members. Please try again.';
        this.isAddingMember = false;
      }
    });
  }

  private loadLists() {
    this.listService.getLists(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lists) => {
          this.lists = lists.map(list => ({
            ...list,
            cards: []
          }));
          this.loadCardsForLists();
        },
        error: (error) => {
          console.error('Error loading lists:', error);
        }
      });
  }

  showTooltip(event: MouseEvent, text: string): void {
    if (this.showAddMemberModal) return;

    this.tooltipText = text;
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 40
    };
    this.isTooltipVisible = true;
  }

  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  private loadCardsForLists() {
    this.lists.forEach(list => {
      this.cardService.getCards(list.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cards) => {
            const listIndex = this.lists.findIndex(l => l.id === list.id);
            if (listIndex !== -1) {
              this.lists[listIndex].cards = cards.map(card => ({
                ...card,
                comments: [],
                newComment: ''
              }));
              this.loadCommentsForCards(listIndex);
            }
          },
          error: (error) => {
            console.error('Error loading cards:', error);
          }
        });
    });
  }

  private loadCommentsForCards(listIndex: number) {
    this.lists[listIndex].cards.forEach(card => {
      this.commentService.getComments(card.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (comments) => {
            const cardIndex = this.lists[listIndex].cards.findIndex(c => c.id === card.id);
            if (cardIndex !== -1) {
              this.lists[listIndex].cards[cardIndex].comments = comments;
            }
          },
          error: (error) => {
            console.error('Error loading comments:', error);
          }
        });
    });
  }

  onDrop(event: any, listId: number) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const card = event.previousContainer.data[event.previousIndex];
      const previousList = this.lists.find(list => list.cards.some(c => c.id === card.id));

      if (!previousList) {
        console.error('Could not find previous list for card:', card);
        return;
      }

      const originalListId = card.listId;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      card.listId = listId;

      const updatePayload: Partial<CardDTO> = {
        id: card.id,
        title: card.title,
        tag: card.tag,
        description: card.description,
        listId: listId,
        members: card.members || []
      };

      this.cardService.updateCard(card.id, updatePayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedCard) => {
            Object.assign(card, updatedCard);
          },
          error: (error) => {
            console.error('Error updating card:', error);
            card.listId = originalListId;
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          }
        });
    }
  }

  onShowAddCardForm(listId: number) {
    this.activeListId = listId;
  }

  onAddCard(payload: { listId: number, title: string, tag:string, description: string }) {
    if (!payload.title.trim()) return;

    const cardPayload = {
      title: payload.title,
      tag: payload.tag,
      description: payload.description,
      listId: payload.listId,
      members: []
    };

    this.cardService.createCard(cardPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newCard) => {
          const list = this.lists.find(l => l.id === payload.listId);
          if (list) {
            list.cards.push({
              ...newCard,
              comments: [],
              newComment: ''
            });
          }
          this.activeListId = null;
        },
        error: (error) => {
          console.error('Error creating card:', error);
        }
      });
  }

  onCancelAddCard() {
    this.activeListId = null;
  }

  addList() {
    if (!this.newListName.trim()) return;

    const payload = {
      name: this.newListName,
      color: this.newListColor,
      boardId: this.boardId
    };

    this.listService.createList(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newList) => {
          this.lists.push({
            ...newList,
            cards: []
          });
          this.newListName = '';
          this.newListColor = '#4F46E5';
          this.showAddListForm = false;
        },
        error: (error) => {
          console.error('Error creating list:', error);
        }
      });
  }

  cancelAddList() {
    this.newListName = '';
    this.newListColor = '#4F46E5';
    this.showAddListForm = false;
  }

  getTotalTasks(): number {
    return this.lists.reduce((acc, list) => acc + list.cards.length, 0);
  }

onUpdateList(event: { listId: number, name: string, color: string }) {
  this.listService.updateList({
    id: event.listId,
    name: event.name,
    color: event.color
  }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (updatedList) => {
        const index = this.lists.findIndex(l => l.id === event.listId);
        if (index !== -1) {
          this.lists = this.lists.map((list, i) => 
            i === index ? { ...list, ...updatedList } : list
          );
        }
      },
      error: (error) => {
        console.error('Failed to update list. Please try again.', error);
      }
    });
}

  onDeleteCard(cardId: number, listId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.cardService.deleteCard(cardId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const list = this.lists.find(l => l.id === listId);
            if (list) {
              list.cards = list.cards.filter(c => c.id !== cardId);
            }
          },
          error: (error) => {
            console.error('Error deleting card:', error);
            alert('Failed to delete the task. Please try again.');
          }
        });
    }
  }
  onListDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.lists, event.previousIndex, event.currentIndex);
  }

  onDeleteList(listId: number) {
    if (confirm('Are you sure you want to delete this list? All tasks in this list will also be deleted.')) {
      this.listService.deleteList(listId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.lists = this.lists.filter(l => l.id !== listId);
          },
          error: (error) => {
            console.error('Error deleting list:', error);
            alert('Failed to delete the list. Please try again.');
          }
        });
    }
  }

  onToggleCardComments(cardId: number) {
    if (this.openCommentCards.has(cardId)) {
      this.openCommentCards.delete(cardId);
    } else {
      this.openCommentCards.add(cardId);
    }
  }

  isCommentsOpen(cardId: number): boolean {
    return this.openCommentCards.has(cardId);
  }

  onAddComment(event: { card: any, listId: number }) {
    if (!event.card.newComment?.trim()) return;

    const payload: Partial<CommentDTO> = {
      content: event.card.newComment.trim(),
      cardId: event.card.id,
      user: this.currentUser
    };

    this.commentService.createComment(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newComment: CommentDTO) => {
          const commentWithUser: CommentDTO = {
            ...newComment,
            user: this.currentUser
          };

          const list = this.lists.find(l => l.id === event.listId);
          if (list) {
            const card = list.cards.find(c => c.id === event.card.id);
            if (card) {
              if (!card.comments) {
                card.comments = [];
              }
              card.comments.push(commentWithUser);
              card.newComment = '';

              list.cards = [...list.cards];
            }
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        }
      });
  }

  onDeleteCardComment(event: { commentId: number, card: any, listId: number }) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(event.commentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const list = this.lists.find(l => l.id === event.listId);
            if (list) {
              const card = list.cards.find(c => c.id === event.card.id);
              if (card) {
                card.comments = card.comments.filter((c: CommentDTO) => c.id !== event.commentId);
                list.cards = [...list.cards];
              }
            }
          },
          error: (error) => {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
          }
        });
    }
  }


isMembersExpanded = false;
maxVisibleMembers = 4;

getVisibleMembers(): any[] {
  if (this.isMembersExpanded || !this.boardMembersWithDetails) {
    return this.boardMembersWithDetails || [];
  }
  return this.boardMembersWithDetails.slice(0, this.maxVisibleMembers);
}

hasHiddenMembers(): boolean {
  if (!this.boardMembersWithDetails) return false;
  return this.boardMembersWithDetails.length > this.maxVisibleMembers;
}

getHiddenMembersCount(): number {
  if (!this.boardMembersWithDetails) return 0;
  return this.boardMembersWithDetails.length - this.maxVisibleMembers;
}

toggleMemberExpansion(): void {
  this.isMembersExpanded = !this.isMembersExpanded;
}

onMemberClick(member: any): void {
  console.log('Member clicked:', member);
}

showAllMembersTooltip(event: MouseEvent): void {
  if (this.isMembersExpanded) return;
  
  const hiddenMembers = this.boardMembersWithDetails.slice(this.maxVisibleMembers);
  const tooltipText = hiddenMembers.map(m => m.email).join(', ');
  
  this.tooltipText = tooltipText;
  this.tooltipPosition = {
    x: event.clientX,
    y: event.clientY - 40
  };
  this.isTooltipVisible = true;
}
}