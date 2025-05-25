import { Injectable, NotFoundException } from '@nestjs/common';
import { PostCreateDto } from '../dto/post-create.dto';
import { Post, PostDocument, PostModelType } from '../schemas/post.schema';
import { PostsRepository } from '../repositories/posts.repository';
import { PostUpdateDto } from '../dto/post-update.dto';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(createPostDto: PostCreateDto) {
    const blog = await this.blogsRepository.getOne(createPostDto.blogId!);
    if (!blog) {
      throw new NotFoundException(`Blog by ${createPostDto.blogId} not found`);
    }
    const post = this.PostModel.createInstance(
      {
        title: createPostDto.title,
        shortDescription: createPostDto.shortDescription,
        content: createPostDto.content,
      },
      createPostDto.blogId!,
      blog.name,
    );
    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async updatePost(
    id: string,
    postDto: PostUpdateDto,
  ): Promise<PostDocument | null> {
    return await this.postsRepository.update(id, postDto);
  }

  async deletePost(id: string): Promise<PostDocument | null> {
    return await this.postsRepository.delete(id);
  }
}
