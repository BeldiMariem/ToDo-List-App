import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [CommonModule, CdkDropList, FormsModule, CardComponent]
})
export class ListComponent {
  @Input() list!: any;
  @Input() activeListId: number | null = null;
  @Input() currentUser!: any;
  @Input() openCommentCards: Set<number> = new Set();

  @Output() delete = new EventEmitter<number>();
  @Output() showAddCardForm = new EventEmitter<number>();
  @Output() addCard = new EventEmitter<{listId: number, title: string, description: string}>();
  @Output() cancelAddCard = new EventEmitter<void>();
  @Output() drop = new EventEmitter<any>();
  @Output() deleteCard = new EventEmitter<{cardId: number, listId: number}>();
  @Output() toggleCardComments = new EventEmitter<number>();
  @Output() deleteCardComment = new EventEmitter<{commentId: number, card: any, listId: number}>(); // FIXED: Added listId
  @Output() addComment = new EventEmitter<{card: any, listId: number}>(); 

  newCardTitle = '';
  newCardDescription = '';

  onAddCard() {
    this.addCard.emit({
      listId: this.list.id,
      title: this.newCardTitle,
      description: this.newCardDescription
    });
    this.newCardTitle = '';
    this.newCardDescription = '';
  }

  onDeleteCard(cardId: number) {
    this.deleteCard.emit({cardId, listId: this.list.id});
  }

  onToggleCardComments(cardId: number) {
    this.toggleCardComments.emit(cardId);
  }



  onDeleteCardComment(event: {commentId: number, card: any, listId: number}) {
    this.deleteCardComment.emit(event); 
  }

  isCommentsOpen(cardId: number): boolean {
    return this.openCommentCards.has(cardId);
  }
  
  onAddComment(event: {card: any, listId: number}) {
    this.addComment.emit(event);
  }
}