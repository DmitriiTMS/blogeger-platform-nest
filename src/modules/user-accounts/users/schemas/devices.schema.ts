import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Devices {
  @Prop({ type: String })
  ip: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: Date })
  lastActiveDate: Date;

  @Prop({ type: String })
  deviceId: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  refreshToken: string;
}
export const DevicesSchema = SchemaFactory.createForClass(Devices);

//регистрирует методы сущности в схеме
DevicesSchema.loadClass(Devices);

//Типизация документа
export type DevicesDocument = HydratedDocument<Devices>;

//Типизация модели + статические методы
export type DevicesModelType = Model<DevicesDocument> & typeof Devices;
