import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { Blog, BlogDocument, BlogModelType } from '../schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: CreateAndUpdateBlogtDto): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
    });
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }

  async updateBlog(id: string, blogDto: CreateAndUpdateBlogtDto) {
    const blog = await this.blogsRepository.getByIdOrNotFoundFail(id);
    blog?.update(blogDto);
    await this.blogsRepository.save(blog!);
  }

  async deleteBlog(id: string): Promise<BlogDocument | null> {
    return await this.blogsRepository.delete(id);
  }
}
