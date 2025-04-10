import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SharedModule } from '../../common/shared/shared.module';
import { AccountsModule } from '../accounts/accounts.module';
import { LocalStrategy } from '../../common/strategies/local-strategy/local-strategy';
import { JwtStrategy } from '../../common/strategies/jwt-strategy/jwt-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => SharedModule),
    AccountsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, LocalStrategy, JwtStrategy],
  exports: [UsersService, UsersModule, TypeOrmModule],
})
export class UsersModule {}
