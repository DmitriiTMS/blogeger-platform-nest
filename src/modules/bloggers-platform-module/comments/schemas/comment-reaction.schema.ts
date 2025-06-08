import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class CommentReaction {
  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  commentId: string;
}

export const CommentReactionSchema = SchemaFactory.createForClass(CommentReaction);

//регистрирует методы сущности в схеме
CommentReactionSchema.loadClass(CommentReaction);

//Типизация документа
export type CommentReactionDocument = HydratedDocument<CommentReaction>;

//Типизация модели + статические методы
export type CommentReactionModelType = Model<CommentReactionDocument> & typeof CommentReaction;

