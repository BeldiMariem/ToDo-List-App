
export interface BoardUpdateDTO {
  boardId: number;
  newName?: string; 
  userIds: number[];
  role: string;
}