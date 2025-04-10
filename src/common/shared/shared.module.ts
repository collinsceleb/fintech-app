import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt-strategy/jwt-strategy';
import { UsersModule } from '../../modules/users/users.module';
import { LocalStrategy } from "../strategies/local-strategy/local-strategy";

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: `${configService.get<number>('JWT_EXPIRATION_TIME')}ms`,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [JwtStrategy, LocalStrategy],
  exports: [PassportModule, JwtModule, JwtStrategy, LocalStrategy],
})
export class SharedModule {}
