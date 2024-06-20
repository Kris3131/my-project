import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../auth/auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const mockAuthGuard = {
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = { userId: 1, phone: '1234567890' };
        return true;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            signIn: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user', async () => {
      const userDto: AuthDto = { phone: '1234567890', password: 'password' };
      const result = { success: true, message: 'User registered successfully' };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      expect(await authController.register(userDto)).toBe(result);
      expect(authService.register).toHaveBeenCalledWith(userDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const userDto: AuthDto = { phone: '1234567890', password: 'password' };
      const result = { access_token: 'jwt-token' };

      jest.spyOn(authService, 'signIn').mockResolvedValue(result);

      expect(await authController.login(userDto)).toBe(result);
      expect(authService.signIn).toHaveBeenCalledWith(userDto);
    });
  });

  describe('profile', () => {
    it('should return user profile', () => {
      const req = { user: { userId: 1, phone: '1234567890' } };

      expect(authController.profile(req)).toBe(req.user);
    });
  });
});
