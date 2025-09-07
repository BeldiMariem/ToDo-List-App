export interface UserDTO {
  id: number;
  username: string;
  email?: string;
  hasPassword?: boolean;
  resetToken?: string;
  tokenExpiryDate?:Date;
}