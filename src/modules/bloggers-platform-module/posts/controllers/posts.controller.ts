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
  Query,
} from '@nestjs/common';
import { PostCreateDto } from '../dto/post-create.dto';
import { PostsService } from '../services/posts.service';
import { PostViewDto } from '../dto/view-dto/post.view-dto';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { PostUpdateDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(@Query() query: GetPostsQueryParams):Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.postsQueryRepository.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOnePost(@Param('id') id: string): Promise<PostViewDto | null> {
    return await this.postsQueryRepository.getOneWithReactions(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() body: PostCreateDto): Promise<PostViewDto> {
    const postId = await this.postsService.createPost(body);
    return await this.postsQueryRepository.getOneWithReactions(postId)
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOnePost(@Param('id') id: string, @Body() body: PostUpdateDto) {
    const post = await this.postsService.updatePost(id, body);
    if (!post) throw new NotFoundException(`Post by ${id} not found`);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param('id') id: string) {
    const post = await this.postsService.deletePost(id);
    if (!post) throw new NotFoundException(`Post by ${id} not found`);
  }

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  async getAllCommentsByPostId(@Param('postId') postId: string, @Query() query: GetPostsQueryParams) {
    return await this.postsQueryRepository.getAllCommentsByPostId(postId, query);
  }
}
