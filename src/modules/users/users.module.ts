import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from "@nestjs/jwt";
import { SharedModule } from "../../common/shared/shared.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => SharedModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UsersModule, TypeOrmModule],
})
export class UsersModule {}
