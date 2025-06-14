import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshTokens {
  @Prop({ type: String })
  refreshToken: string;
}
export const RefreshTokensSchema = SchemaFactory.createForClass(RefreshTokens);

//регистрирует методы сущности в схеме
RefreshTokensSchema.loadClass(RefreshTokens);

//Типизация документа
export type RefreshTokensDocument = HydratedDocument<RefreshTokens>;

//Типизация модели + статические методы
export type RefreshTokensModelType = Model<RefreshTokensDocument> &
  typeof RefreshTokens;
