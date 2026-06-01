import { Body, Controller, Post, HttpCode, Get, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "@nestjs/passport";

//route beging with auth
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  //create /login endpoint for post request
  @Post('login')
  @HttpCode(200)
  // parse JSON body
  login(@Body() dto: LoginDto) {
    //request is then forwarwded to service
    return this.authService.login(dto.username, dto.password);
  };

  //add the protected route
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
  
}