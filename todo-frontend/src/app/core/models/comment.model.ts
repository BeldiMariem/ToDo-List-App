import { UserDTO } from "./user/user-dto.model";

export interface CommentDTO {
  id: number;
  content: string;
  cardId: number;
  user: UserDTO;
  createdAt: string;
}
