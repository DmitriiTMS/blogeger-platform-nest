import { Injectable } from '@nestjs/common';
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
    return await this.userModel.findOne({ _id: new Types.ObjectId(id) }).lean<UserDocument>();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).lean<UserDocument>();
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ login }).lean<UserDocument>();
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({
        $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
      })
      .lean<UserDocument>();
  }

  async updateUserСonfirmationCode(id: string, code: string) {
    return await this.userModel
      .updateOne(
        { _id: id },
        {
          $set: {
            'emailConfirmation.confirmationCode': code,
          },
        },
      )
      .lean();
  }

  async findBYCodeEmail(code: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({
        'emailConfirmation.confirmationCode': code,
      })
      .lean<UserDocument>();
  }

  async updateUserPassword(
    id: string,
    password: string,
  ): Promise<UserDocument | null> {
    return await this.userModel
      .updateOne(
        { _id: id },
        {
          $set: {
            hashPassword: password,
          },
        },
      )
      .lean<UserDocument>();
  }

  async updateUserIsConfirmed(id: string): Promise<UserDocument | null> {
    return await this.userModel
      .updateOne(
        { _id: id },
        {
          $set: {
            'emailConfirmation.isConfirmed': true,
          },
        },
      )
      .lean<UserDocument>();
  }
}
