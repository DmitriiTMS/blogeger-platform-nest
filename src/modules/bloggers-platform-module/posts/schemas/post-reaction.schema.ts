import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Schema({ timestamps: true, collection: 'post_reactions' })
export class PostReaction {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(LikeStatus),
  })
  status: LikeStatus;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  postId: string;
}

export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);

//регистрирует методы сущности в схеме
// PostReactionSchema.loadClass(PostReaction);

//Типизация документа
export type PostReactionDocument = HydratedDocument<PostReaction>;

//Типизация модели + статические методы
export type PostReactionModelType = Model<PostReactionDocument> & typeof PostReaction;
