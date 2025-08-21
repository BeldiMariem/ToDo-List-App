import { UserDTO } from "./user/user-dto.model";

export interface BoardDTO {
  id: number;
  name: string;
  owner: UserDTO;
  members: UserDTO[];
}
