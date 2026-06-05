export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface CreatedUser {
  id: number;
  username: string;
}