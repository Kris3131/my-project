import {
  Injectable,
  UnauthorizedException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userData: AuthDto): Promise<any> {
    const { phone, password } = userData;
    const exitingUser = await this.usersService.findOne(phone);
    if (exitingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return this.usersService.createBasicUser({
      phone,
      password: hashedPassword,
    });
  }
  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(phone);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async signIn(userDto: AuthDto): Promise<any> {
    const { phone, password } = userDto;
    const user = await this.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
