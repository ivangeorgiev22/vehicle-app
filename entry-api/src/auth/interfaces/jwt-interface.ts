export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

export interface JwtUser {
  id: number;
  username: string;
  role: string;
}