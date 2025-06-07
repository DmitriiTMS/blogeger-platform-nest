import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, default: 0, required: true })
  likesCount: number;

  @Prop({ type: Number, default: 0, required: true })
  dislikesCount: number;

}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

