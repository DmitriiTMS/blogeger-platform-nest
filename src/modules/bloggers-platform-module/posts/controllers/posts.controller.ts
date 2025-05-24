import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PostCreateDto } from '../dto/post-create.dto';
import { PostsService } from '../services/posts.service';
import { PostViewDto } from '../dto/view-dto/post.view-dto';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { PostUpdateDto } from '../dto/post-update.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() body: PostCreateDto): Promise<PostViewDto> {
    const post = await this.postsService.createPost(body);
    return PostViewDto.mapToView(post);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(): Promise<PostViewDto[]> {
    const postsDB = await this.postsQueryRepository.getAll();
    const items = postsDB.map((post) => PostViewDto.mapToView(post));
    return items;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOnePost(@Param('id') id: string): Promise<PostViewDto | null> {
    const blog = await this.postsQueryRepository.getOne(id);
    if (!blog) throw new NotFoundException(`Post by ${id} not found`);
    return PostViewDto.mapToView(blog);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOnePost(@Param('id') id: string, @Body() body: PostUpdateDto) {
    const blog = await this.postsService.updatePost(id, body);
    if (!blog) throw new NotFoundException(`Post by ${id} not found`);
    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param('id') id: string) {
    const blog = await this.postsService.deletePost(id);
    if (!blog) throw new NotFoundException(`Post by ${id} not found`);
    return;
  }
}
