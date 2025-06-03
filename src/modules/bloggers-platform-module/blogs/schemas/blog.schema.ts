import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  createdAt: Date;

  static createInstance(dto: CreateAndUpdateBlogtDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    return blog as BlogDocument;
  }

  update(dto: CreateAndUpdateBlogtDto) {
    if (
      dto.name !== this.name ||
      dto.description !== this.description ||
      dto.websiteUrl !== this.websiteUrl
    ) {
      this.name = dto.name;
      this.description = dto.description;
      this.websiteUrl = dto.websiteUrl;
    } else {
      throw new Error('не переданно правильно dto')
    }
  }
  
}
//static create
// update
// delete

export const BlogSchema = SchemaFactory.createForClass(Blog);

//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
