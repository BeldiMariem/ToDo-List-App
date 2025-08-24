import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { BoardDTO } from '../../../core/models/board.model';
import { ListDTO } from '../../../core/models/list.model';
import { CardDTO } from '../../../core/models/card.model';
import { CommentDTO } from '../../../core/models/comment.model';
import { UserDTO } from '../../../core/models/user/user-dto.model';

import { CardService } from '../../../core/services/card.service';
import { ListService } from '../../../core/services/list.service';
import { CommentService } from '../../../core/services/comment.service';
import { BoardService } from '../../../core/services/board.service';
import { AuthService } from '../../../core/services/auth.service';

import { ListComponent } from '../list/list.component';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { FormsModule } from '@angular/forms'; 
interface ListWithCards extends ListDTO {
  cards: (CardDTO & { comments: CommentDTO[]; newComment: string })[];
}

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, ListComponent, FormsModule]
})
export class BoardDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private listService = inject(ListService);
  private cardService = inject(CardService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  boardId!: number;
  board: BoardDTO | null = null;
  lists: ListWithCards[] = [];
  currentUser!: UserDTO;

  newListName = '';
  newListColor = '#4F46E5';
  showAddListForm = false;
  activeListId: number | null = null;
  openCommentCards = new Set<number>();

  ngOnInit() {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCurrentUser();
    this.loadBoardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
  }

  private loadBoardData() {
    this.boardService.getBoard(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (board) => {
          this.board = board;
          this.loadLists();
        },
        error: (error) => {
          console.error('Error loading board:', error);
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
      
      const previousListId = previousList.id;
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

  onAddCard(payload: {listId: number, title: string, description: string}) {
    if (!payload.title.trim()) return;

    const cardPayload = {
      title: payload.title,
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

  onAddComment(event: {card: any, listId: number}) {
      console.log('BoardDetailComponent: Received addCardComment event', event);

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

  onDeleteCardComment(event: {commentId: number, card: any, listId: number}) {
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
}