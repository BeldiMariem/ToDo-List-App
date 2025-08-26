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
  @Output() deleteCardComment = new EventEmitter<{commentId: number, card: any, listId: number}>();
  @Output() addComment = new EventEmitter<{card: any, listId: number}>();
  @Output() updateList = new EventEmitter<{listId: number, name: string, color: string}>();

  newCardTitle = '';
  newCardDescription = '';
  isEditing = false;
  editedName = '';
  editedColor = '';

  getListBackground(): string {
    const color = this.list.color || '#4F46E5';
    return `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%), 
            radial-gradient(circle at top right, ${color}15 0%, transparent 50%)`;
  }

  getContrastColor(bgColor: string): string {
    const color = bgColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#1e293b' : '#ffffff';
  }

  getCompletedCount(): number {
    return Math.floor(this.list.cards.length * 0.3); 
  }

  getProgressPercentage(): number {
    return (this.getCompletedCount() / this.list.cards.length) * 100;
  }

startEdit(): void {
    this.isEditing = true;
    this.editedName = this.list.name;
    this.editedColor = this.list.color;
    
    setTimeout(() => {
      const input = document.querySelector('.edit-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  saveEdit(): void {
    if (this.editedName.trim() && this.editedColor) {
      this.updateList.emit({
        listId: this.list.id,
        name: this.editedName.trim(),
        color: this.editedColor
      });
      this.isEditing = false;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editedName = this.list.name;
    this.editedColor = this.list.color;
  }

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