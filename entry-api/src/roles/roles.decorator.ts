import { SetMetadata } from "@nestjs/common";

// attaches metadata to a route letting the guard know what roles are allowed e.g. ADMIN

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)