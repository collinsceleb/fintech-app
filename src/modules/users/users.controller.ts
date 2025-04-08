import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiOkResponse } from '@nestjs/swagger';
import { TokenResponse } from '../../common/class/token-response/token-response';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: User,
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOkResponse({
    type: TokenResponse,
    description: 'Login successful',
    schema: { example: TokenResponse },
  })
  async login(@Body() createAuthDto: CreateAuthDto): Promise<TokenResponse> {
    return await this.usersService.login(createAuthDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
