import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';
import { TokenResponse } from '../../common/class/token-response/token-response';
import { JwtPayload } from '../../common/class/jwt-payload/jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';

@Injectable()
export class UsersService {
  private readonly PASSWORD_RETRIES =
    this.configService.get<number>('PASSWORD_RETRIES');
  private readonly JWT_EXPIRATION_TIME =
    this.configService.get<number>('JWT_EXPIRATION_TIME') * 1000;
  private readonly JWT_ACCESS_EXPIRATION_TIME = this.configService.get<number>(
    'JWT_ACCESS_EXPIRATION_TIME',
  );
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly accountsService: AccountsService,
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
      const newUser = this.usersRepository.create({
        email,
        password,
        firstName,
        lastName,
      });
      await newUser.hashPassword();
      await this.usersRepository.save(newUser);
      await this.accountsService.createAccount(newUser);
      const user = await this.usersRepository.findOne({
        where: { id: newUser.id },
        relations: ['account'],
      });
      return user;
    } catch (error) {
      console.error('Error registering user', error);
      throw new InternalServerErrorException(
        'An error occurred while registering the user. Please check server logs for details.',
        error.message,
      );
    }
  }

  async validateUser(createAuthDto: CreateAuthDto): Promise<User | null> {
    try {
      const { email, password } = createAuthDto;
      const user = await this.usersRepository.findOne({ where: { email } });
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        user.failedAttempts = Math.max(0, user.failedAttempts + 1);
        await this.usersRepository.save(user);
        if (user.failedAttempts >= this.PASSWORD_RETRIES) {
          user.isLocked = true;
          await this.usersRepository.save(user);
          throw new BadRequestException(
            'Maximum password attempts reached. Kindly reset your password.',
          );
        }
        throw new BadRequestException(
          'Incorrect password. Kindly reset your password.',
        );
      }
      if (user && isPasswordValid) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error validating user:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while validating user. Please check server logs for details.',
        error.message,
      );
    }
  }
  async generateTokens(user: User): Promise<TokenResponse> {
    try {
      // const jwtId = crypto.randomUUID();
      const payload: JwtPayload = {
        sub: user.id as unknown as User,
        email: user.email,
        jwtId: crypto.randomUUID(),
      };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.JWT_ACCESS_EXPIRATION_TIME,
      });
      const refreshTokenPayload = {
        ...payload,
        jwtId: crypto.randomUUID(),
      };
      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: this.JWT_EXPIRATION_TIME,
      });
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      console.error('Error generating tokens:', e);
      throw new InternalServerErrorException(
        'An error occurred while generating tokens. Please check server logs for details.',
        e.message,
      );
    }
  }

  async login(createAuthDto: CreateAuthDto): Promise<TokenResponse> {
    try {
      const { email, password } = createAuthDto;
      if (typeof email !== 'string') {
        throw new BadRequestException('Email must be a string');
      }
      if (typeof password !== 'string') {
        throw new BadRequestException('Password must be a string');
      }
      if (!isEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      if (existingUser.isLocked) {
        throw new BadRequestException(
          'Account is locked. Kindly reset your password.',
        );
      }
      const isPasswordValid = await existingUser.comparePassword(password);
      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect password');
      }
      existingUser.lastLogin = new Date();
      await this.usersRepository.save(existingUser);
      const tokenDetails = await this.generateTokens(existingUser);
      return {
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
      };
    } catch (error) {
      console.error('Error logging in user:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while logging in user. Please check server logs for details.',
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
