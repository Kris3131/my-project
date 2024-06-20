import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ example: '1234567890', description: 'User phone number' })
  phone: string;

  @ApiProperty({ example: 'userpassword', description: 'User password' })
  password: string;
}
