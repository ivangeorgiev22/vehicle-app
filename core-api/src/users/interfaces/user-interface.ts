export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface CreatedUser {
  id: string;
  username: string;
}