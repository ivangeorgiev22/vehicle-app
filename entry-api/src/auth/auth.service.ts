import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { JwtService } from "@nestjs/jwt";
import { AuthResponse } from "./interfaces/auth-interface";

@Injectable()
export class AuthService {
  constructor(private coreApi: ApiClient, private jwtService: JwtService) {}
  // handles login request
  async login (username: string, password: string): Promise<AuthResponse> {
    //validates user via core api
    const user = await this.coreApi.validateUser(username, password);
    // if user is invalid throw an error
    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    // create JWT payload (what gets encoded into the token)
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    //generate token
    const token = this.jwtService.sign(payload);
    
    return {
      accessToken: token,
      isAdmin: user.role === 'ADMIN',
      user: {
        id: user.id,
        username: user.username
      }
    };
  }
}