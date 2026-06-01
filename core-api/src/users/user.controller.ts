import { Body, Controller, Post, HttpCode } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { LoginUserDto } from "./dto/login-user.dto";
//http layer, handles incoming requests
//controller is the base route with /users 
@Controller('users')
export class UsersController {
    //dependency injection, meaning Nest gives this controller access to UsersService
    constructor(private usersService: UsersService) {}
    // Post method for registering a user 
    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }
    // post method for log in which validates credentials
    // JSON request is parsed into a DTO object
    @Post('validate')
    @HttpCode(200)
    validate(@Body() dto: LoginUserDto) {
        return this.usersService.validateUser(dto.username, dto.password);
    }
}