import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const authService = {
    register: () => ({
      success: true,
      message: 'User registered successfully',
    }),
    signIn: () => ({ access_token: 'jwt-token' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ phone: '1234567890', password: 'password' })
      .expect(200)
      .expect({
        success: true,
        message: 'User registered successfully',
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: '1234567890', password: 'password' })
      .expect(200)
      .expect({
        access_token: 'jwt-token',
      });
  });

  it('/auth/profile (GET)', () => {
    const jwtService = app.get(JwtService);
    const token = jwtService.sign({ userId: 1 });

    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({
        userId: 1,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
