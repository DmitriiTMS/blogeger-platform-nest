import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { Blog, BlogModelType } from '../schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostByBlogIdDto } from '../dto/create-post-by-blogId.dto';
import { PostsService } from '../../posts/services/posts.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private postsService: PostsService,
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
    blog.update(blogDto);
    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string) {
    await this.blogsRepository.delete(id);
  }

  async createPostByBlogId(
    blogId: string,
    postByBlogIdDto: CreatePostByBlogIdDto,
  ): Promise<string> {
    return await this.postsService.createPost({ ...postByBlogIdDto, blogId });
  }
}
