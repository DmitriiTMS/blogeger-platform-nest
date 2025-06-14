import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../posts/schemas/extendedLikesInfo.schema';

@Schema({ _id: false })
export class LikesInfo {
  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({
    type: String,
    enum: Object.values(LikeStatus),
    default: LikeStatus.NONE,
    required: true,
  })
  myStatus: LikeStatus;

  static createInstance(dto: { likesCount: number; dislikesCount: number;  myStatus: LikeStatus;}) {
    const likesInfo = new this();
    likesInfo.likesCount = dto.likesCount;
    likesInfo.dislikesCount = dto.dislikesCount;
    likesInfo.myStatus = dto.myStatus;
    return likesInfo;
  }
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
