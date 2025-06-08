import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../posts/schemas/extendedLikesInfo.schema';
import { PostDataCommentCreateDto } from '../../posts/dto/post-data-comment-create.dto';
import { CommentatorInfo, CommentatorInfoSchema } from './commentatorInfo.schema';
import { LikesInfo, LikesInfoSchema } from './likesInfo.schema';

@Schema({ timestamps: true })
export class Comment {

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;

  createdAt: Date;

  static createInstance( dto: PostDataCommentCreateDto, userLogin: string,): CommentDocument {

    const comment = new this();

    comment.content = dto.content,
    comment.postId = dto.postId,
    comment.commentatorInfo = CommentatorInfo.createInstance({
      userId: dto.userId,
      userLogin
    })
    comment.likesInfo = LikesInfo.createInstance({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.NONE
    })

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
