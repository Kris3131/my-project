import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userData: { phone: string; password: string }): Promise<any> {
    return this.usersService.createBasicUser(userData);
  }

  async signIn(phone: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(phone);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
