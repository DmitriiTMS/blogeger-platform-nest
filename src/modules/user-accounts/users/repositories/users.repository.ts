import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { User, UserDocument } from '../schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async save(user: UserDocument) {
    await user.save();
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
