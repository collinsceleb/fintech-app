import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../../modules/users/users.service';
import { CreateAuthDto } from '../../../modules/users/dto/create-auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(createAuthDto: CreateAuthDto) {
    const user = await this.usersService.validateUser(createAuthDto);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
