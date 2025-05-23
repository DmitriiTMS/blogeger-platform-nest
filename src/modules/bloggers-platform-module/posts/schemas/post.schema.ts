import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExtendedLikesInfo, ExtendedLikesInfoSchema } from './extendedLikesInfo.schema';

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

  @Prop({ type: String })
  blogName: string;

  @Prop({ type: ExtendedLikesInfoSchema, required: true })
  extendedLikesInfo: ExtendedLikesInfo

  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;
