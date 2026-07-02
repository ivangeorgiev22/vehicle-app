import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, UseGuards } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{imageUrl: string}> {
    const img = await this.usersService.uploadImage(id, file);
    return img;
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string): Promise<{imageUrl: string | null}> {
    const img = await this.usersService.getImage(id);
    return img;
  }
}