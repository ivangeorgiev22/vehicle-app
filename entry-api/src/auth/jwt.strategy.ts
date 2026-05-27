import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy} from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    //extract token from request header and validate the secret key
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super-super-secret-key'
    });
  }
  //once token validation is successful validate runs 
  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    };
  }
}