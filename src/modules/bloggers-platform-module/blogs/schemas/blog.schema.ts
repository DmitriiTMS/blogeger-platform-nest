import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true, max: 15 })
  name: string;

  @Prop({type: String})
  description: number;

  @Prop({type: String})
  websiteUrl: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
