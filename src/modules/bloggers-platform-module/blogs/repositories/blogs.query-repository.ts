import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async getAll(): Promise<BlogDocument[]> {
    return await this.blogModel.find()
  }

   async getOne(id: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(id)
  }
}
