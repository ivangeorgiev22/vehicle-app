export interface AuthResponse {
  accessToken: string;
  isAdmin: boolean;
  user: {
    id: number;
    username: string;
  }
}

export interface User {
  id: number;
  username: string;
  role: string;
}