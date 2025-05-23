import { Injectable } from '@nestjs/common';
import { PostCreateDto } from '../dto/post-create.dto';
import { Post, PostDocument } from '../schemas/post.schema';
import { PostsRepository } from '../repositories/posts.repository';
import { BlogsQueryRepository } from '../../blogs/repositories/blogs.query-repository';
import { PostUpdateDto } from '../dto/post-update.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async createPost(createPostDto: PostCreateDto): Promise<PostDocument> {
    const blog = await this.blogsQueryRepository.getOne(createPostDto.blogId);
    return await this.postsRepository.create(createPostDto, blog!.name);
  }

  async updatePost(id: string, postDto: PostUpdateDto): Promise<Post | null> {
    return await this.postsRepository.update(id, postDto);
  }

  async deletePost(id: string): Promise<Post | null> {
    return await this.postsRepository.delete(id);
  }
}
