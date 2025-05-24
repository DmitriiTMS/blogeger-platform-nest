import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogDocument | null> {
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      throw new NotFoundException(`Blog by ${id} not found`);
    }
    return blog;
  }

  async delete(id: string): Promise<BlogDocument | null> {
    return await this.blogModel.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
