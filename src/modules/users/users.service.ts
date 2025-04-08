import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async checkUserExist(email: string) {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (user) {
        throw new BadRequestException('User already exists');
      }
      return user;
    } catch (e) {
      throw new InternalServerErrorException('Error checking user', e);
    }
  }
  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password, firstName, lastName } = createUserDto;
      await this.checkUserExist(email);
      const user = this.usersRepository.create({
        email,
        password,
        firstName,
        lastName,
      });
      await user.hashPassword();
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      console.error('Error registering user', error);
      throw new InternalServerErrorException(
        'An error occurred while registering the user. Please check server logs for details.',
        error.message,
      );
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
