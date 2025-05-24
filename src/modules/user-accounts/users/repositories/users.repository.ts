import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { User, UserDocument } from '../schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: UserCreateDto): Promise<UserDocument> {
    return await this.userModel.create({
      login: createUserDto.login,
      password: createUserDto.password,
      email: createUserDto.email,
    });
  }

  async delete(id: string): Promise<UserDocument | null> {
    return await this.userModel.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    });
  }

  async getOne(id: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ _id: new Types.ObjectId(id) });
  }
}
