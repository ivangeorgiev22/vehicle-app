import { Body, Controller, Post, HttpCode, UseInterceptors, UploadedFile, Param, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { LoginUserDto } from "./dto/login-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersImageService } from "./users-image.service";
import { User, CreatedUser } from "./interfaces/user-interface";

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService, private usersImageService: UsersImageService) {}

    @Post()
    create(@Body() dto: CreateUserDto): Promise<CreatedUser | undefined> {
      return this.usersService.create(dto);
    }
    @Post('validate')
    @HttpCode(200)
    validate(@Body() dto: LoginUserDto): Promise<User | null> {
      return this.usersService.validateUser(dto.username, dto.password);
    }

    @Post(':id/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<{image_url:string}> {
      const img = await this.usersImageService.uploadImage(id,file);
      return img;
    }

    @Get(':id/image')
    async getImage(@Param('id') id: string):Promise<{image_url: string | null}> {
      const img = await this.usersImageService.getImage(id);
      return img;
    }

}