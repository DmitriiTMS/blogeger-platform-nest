import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class AccessToApi {
  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  ip: string;
}
export const AccessToApiSchema = SchemaFactory.createForClass(AccessToApi);

//регистрирует методы сущности в схеме
AccessToApiSchema.loadClass(AccessToApi);

//Типизация документа
export type AccessToApiDocument = HydratedDocument<AccessToApi>;

//Типизация модели + статические методы
export type AccessToApiModelType = Model<AccessToApiDocument> &
  typeof AccessToApi;
