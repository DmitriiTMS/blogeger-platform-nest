import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../schemas/blog.schema';
import { Model } from 'mongoose';
import { BlogViewDto } from '../dto/views-dto/blog.view-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
    });
    if (!blog) {
      throw new NotFoundException(`Blog by ${id} not found`);
    }
    return BlogViewDto.mapToView(blog);
  }

  async getAll(): Promise<BlogViewDto[]> {
    const blogs = await this.blogModel.find();
    const items = blogs.map((blog) => BlogViewDto.mapToView(blog));
    return items;
  }

  async getOne(id: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(id)
  }
}
