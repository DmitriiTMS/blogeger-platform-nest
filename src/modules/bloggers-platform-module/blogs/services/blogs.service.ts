import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { Blog, BlogDocument, BlogModelType } from '../schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostByBlogIdDto } from '../dto/create-post-by-blogId.dto';
import { PostsRepository } from '../../posts/repositories/posts.repository';
import { Post, PostModelType } from '../../posts/schemas/post.schema';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
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

  async deleteBlog(id: string): Promise<BlogDocument | null> {
    return await this.blogsRepository.delete(id);
  }

  async createPostByBlogId(
    blogId: string,
    postByBlogIdDto: CreatePostByBlogIdDto,
  ): Promise<string> {
    const blog = await this.blogsRepository.getOne(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog by ${blogId} not found`);
    }
    const post = this.PostModel.createInstance(
      {
        title: postByBlogIdDto.title,
        shortDescription: postByBlogIdDto.shortDescription,
        content: postByBlogIdDto.content,
      },
      blogId,
      blog.name,
    );

    await this.postsRepository.save(post);
    return post._id.toString();
  }
}
