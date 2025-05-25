import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ExtendedLikesInfo, ExtendedLikesInfoSchema, LikeStatus } from './extendedLikesInfo.schema';
import { BlogDocument } from '../../blogs/schemas/blog.schema';
import { PostCreateDto } from '../dto/post-create.dto';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: ExtendedLikesInfoSchema, required: true })
  extendedLikesInfo: ExtendedLikesInfo

  createdAt: Date;

  
  static createInstance(dto: PostCreateDto, blogId: string, blogName: string): PostDocument {
    const post = new this();

    post.title = dto.title,
    post.shortDescription = dto.shortDescription
    post.content = dto.content
    post.blogId = blogId
    post.blogName = blogName
    post.extendedLikesInfo = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE
    };

    return post as PostDocument;
  }
}


export const PostSchema = SchemaFactory.createForClass(Post);

//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;