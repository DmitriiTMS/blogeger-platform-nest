import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserDocument } from '../schemas/users.schema';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(createUserDto: UserCreateDto): Promise<UserDocument> {
    return await this.usersRepository.create(createUserDto);
  }

  async deleteUser(id: string): Promise<UserDocument | null> {
    const user = await this.usersRepository.getOne(id);
    if (!user) throw new NotFoundException(`User by ${id} not found`);
    return await this.usersRepository.delete(id);
  }
}
