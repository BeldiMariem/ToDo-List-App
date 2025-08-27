import { CardDTO } from './card.model';
import { CommentDTO } from './comment.model';

export interface ExtendedCardDTO extends CardDTO {
  comments: CommentDTO[];
  newComment: string;
}