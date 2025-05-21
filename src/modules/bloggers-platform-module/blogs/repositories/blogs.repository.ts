import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Model, Types } from 'mongoose';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async create(createBlogDto: CreateAndUpdateBlogtDto): Promise<BlogDocument> {
    const createdBlog = new this.blogModel(createBlogDto);
    return createdBlog.save();
  }

  async update(id: string, blogDto: CreateAndUpdateBlogtDto): Promise<Blog | null> {
    return await this.blogModel.findOneAndUpdate(
      { _id: id },
      {
        name: blogDto.name,
        description: blogDto.description,
        websiteUrl: blogDto.websiteUrl,
      },
    );
  }

  async delete(id: string): Promise<Blog | null>{
      return await this.blogModel.findByIdAndDelete({_id: new Types.ObjectId(id)})
  }
}
