import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { User, UserDocument, UserModelType } from '../schemas/users.schema';
import { UsersRepository } from '../repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Bcrypt } from 'src/utils/bcrypt';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: UserCreateDto, emailConfirmation?: any): Promise<string> {
    const userLogin = await this.usersRepository.findByLogin(dto.login);
    const userEmail = await this.usersRepository.findByEmail(dto.email);
    const errors = [{
      message: `User with ${userLogin ? 'login' : userEmail ? 'email' : null} == ${userLogin ? dto.login : userEmail ? dto.email : null} already exists`,
      field: `${userLogin ? 'login' : userEmail ? 'email' : null}`
    }]
    if (userLogin || userEmail) {
      throw new CustomDomainException({
        errorsMessages: [...errors]
      });
    }

    const passwordHash = await Bcrypt.generateHash(dto.password);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    }, emailConfirmation);

    await this.usersRepository.save(user);
    return user._id.toString();
  }

  async deleteUser(id: string): Promise<UserDocument | null> {
    const user = await this.usersRepository.getOne(id);
    if (!user) throw new NotFoundException(`User by ${id} not found`);
    return await this.usersRepository.delete(id);
  }
}
