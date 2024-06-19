import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() userData: { phone: string; password: string }) {
    return this.authService.register(userData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() userData: { phone: string; password: string }) {
    return this.authService.signIn(userData.phone, userData.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Request() req) {
    return req.user;
  }
}
