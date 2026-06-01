import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // reads roles metadata attached to route by @Roles
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // if no role required allows everyone
    if (!roles) {
      return true;
    }
    // gets the user from request
    const { user } = context.switchToHttp().getRequest();
    
    // checks if current user's role matched the required one
    return roles.includes(user.role);
  }
}