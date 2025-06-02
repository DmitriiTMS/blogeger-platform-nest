import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async save(blog: BlogDocument) {
    return await blog.save();
  
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      throw new NotFoundException(`Blog by ${id} not found`);
    }
    return blog;
  }

  async delete(id: string) {
    const blog = await this.getOne(id);
    if(!blog) {
      throw new NotFoundException(`Blog ${id} not found`)
    }
    return await this.blogModel.deleteOne(new Types.ObjectId(id));
  }

   async getOne(id: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(id)
  }
}
