import { UserDTO } from "../user/user-dto.model";

export interface CardDTO {
  id: number;
  title: string;
  description: string;
  listId: number;
  members: UserDTO[];
}
