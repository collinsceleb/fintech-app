import { User } from '../../../modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty({ example: '1' })
  sub: string;

  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: '1234567890' })
  jwtId: string;
}
