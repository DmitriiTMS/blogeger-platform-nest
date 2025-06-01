import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserCreateDto } from '../dto/user-create.dto';


@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  hashPassword: string;

  @Prop({ type: String, required: true })
  email: string;

  createdAt: Date;

  @Prop({ type: Object })
  emailConfirmation: {
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean
  }

  static createInstance(dto: UserCreateDto, emailConfirmation?: any):UserDocument {
    const user = new this();
    user.login = dto.login
    user.email = dto.email
    user.hashPassword = dto.password
    user.emailConfirmation = emailConfirmation
    return user as UserDocument;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
