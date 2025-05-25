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
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { BlogsService } from '../services/blogs.service';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { BlogViewDto } from '../dto/views-dto/blog.view-dto';
import { CreatePostByBlogIdDto } from '../dto/create-post-by-blogId.dto';
import { PostsQueryRepository } from '../../posts/repositories/posts.query-repository';
import { PostViewDto } from '../../posts/dto/view-dto/post.view-dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';
import { GetBlogsQueryParams } from '../paginate/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from '../../posts/paginate/get-posts-query-params.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneBlog(@Param('id') id: string): Promise<BlogViewDto | null> {
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() body: CreateAndUpdateBlogtDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOneBlog(
    @Param('id') id: string,
    @Body() body: CreateAndUpdateBlogtDto,
  ) {
    return await this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param('id') id: string) {
    const blog = await this.blogsService.deleteBlog(id);
    if (!blog) throw new NotFoundException(`Blog by ${id} not found`);
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getAllPostsByBlogId(@Param('blogId') blogId: string, @Query() query: GetPostsQueryParams):Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.postsQueryRepository.getAllWithReactions(blogId, query)
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(@Param('blogId') blogId: string, @Body() body: CreatePostByBlogIdDto): Promise<PostViewDto | null> {
    const postId = await this.blogsService.createPostByBlogId(blogId, body);
    return await this.postsQueryRepository.getOneWithReactions(postId);
  }

}
