import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Schema({ timestamps: true, collection: 'comments_reactions' })
export class CommentReaction {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(LikeStatus),
  })
  status: LikeStatus;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  commentId: string;
}

export const CommentReactionSchema =
  SchemaFactory.createForClass(CommentReaction);

//регистрирует методы сущности в схеме
CommentReactionSchema.loadClass(CommentReaction);

//Типизация документа
export type CommentReactionDocument = HydratedDocument<CommentReaction>;

//Типизация модели + статические методы
export type CommentReactionModelType = Model<CommentReactionDocument> &
  typeof CommentReaction;
