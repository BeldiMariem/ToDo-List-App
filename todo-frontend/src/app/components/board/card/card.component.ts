import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExtendedCardDTO } from '../../../core/models/extended-card';
import { CommentDTO } from '../../../core/models/comment.model';
import { UserDTO } from '../../../core/models/user/user-dto.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, CdkDrag, FormsModule]
})
export class CardComponent {
  @Input() card!: ExtendedCardDTO & { comments: CommentDTO[] };
  @Input() listId!: number;
@Input() color!: string;

  @Input() currentUser!: UserDTO;
  @Input() isCommentsOpen = false;
  
  @Output() delete = new EventEmitter<number>();
  @Output() toggleComments = new EventEmitter<number>();
  @Output() addComment = new EventEmitter<{card: ExtendedCardDTO, listId: number}>();
  @Output() deleteComment = new EventEmitter<{commentId: number, card: any, listId: number}>(); 

  onDelete() {
    this.delete.emit(this.card.id);
  }

  onToggleComments() {
    this.toggleComments.emit(this.card.id);
  }

  onAddComment() {
    this.addComment.emit({card: this.card, listId: this.listId});
  }

  onDeleteComment(commentId: number) {
    this.deleteComment.emit({
      commentId: commentId, 
      card: this.card,
      listId: this.listId  
    });
  }
  
  getMemberUser(member: any): UserDTO {
  return member.user || member;
 }

  getUserAvatar(user: UserDTO): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=32`;
  }
  getOwnerAvatar(user: UserDTO): string {

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=32`;
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  canModifyComment(comment: CommentDTO): boolean {
    return comment.user.id === this.currentUser.id;
  }
    get dragData() {
    return this.card;
  }
}