import { Controller, Post, UseInterceptors, UploadedFile, Param, Get } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersImageService } from "./users-image.service";

@Controller('api/users')
export class UsersController {
    constructor(private usersImageService: UsersImageService) {}

    @Post(':id/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<{imageUrl:string}> {
      const img = await this.usersImageService.uploadImage(id,file);
      return img;
    }

    @Get(':id/image')
    async getImage(@Param('id') id: string):Promise<{imageUrl: string | null}> {
      const img = await this.usersImageService.getImage(id);
      return img;
    }

}