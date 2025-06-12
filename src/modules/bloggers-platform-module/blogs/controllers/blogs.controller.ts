import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { BlogsService } from '../services/blogs.service';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { BlogViewDto } from '../dto/views-dto/blog.view-dto';
import { CreatePostByBlogIdDto } from '../dto/create-post-by-blogId.dto';
import { PostsQueryRepository } from '../../posts/repositories/posts.query-repository';
import { PostViewDto } from '../../posts/dto/view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';
import { GetBlogsQueryParams } from '../paginate/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from '../../posts/paginate/get-posts-query-params.input-dto';
import { BasicAuthGuard } from '../../../../modules/user-accounts/users/guards/basic-auth.guard';
import { AuthorizationCheckGuard } from '../../../../modules/user-accounts/users/guards/authorization-check.guard';
import { ExtractUserIfExistsFromRequest } from '../../../../modules/user-accounts/users/decorators/extract-user-if-exists-from-request.decorator';
import { BlogsCreateCommand } from '../useCases/blog-create-use-case';
import { BlogsUpdateCommand } from '../useCases/blog-update-use-case';
import { BlogsDeleteCommand } from '../useCases/blog-delete-use-case';
import { CreatePostByBlogIdCommand } from '../useCases/create-post-by-blogId';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneBlog(@Param('id') id: string): Promise<BlogViewDto | null> {
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() body: CreateAndUpdateBlogtDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new BlogsCreateCommand(body));
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOneBlog(
    @Param('id') id: string,
    @Body() body: CreateAndUpdateBlogtDto,
  ) {
    return await this.commandBus.execute(new BlogsUpdateCommand(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteOneBlog(@Param('id') id: string) {
    return await this.commandBus.execute(new BlogsDeleteCommand(id));
  }

  @Get(':blogId/posts')
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getAllPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: { userId: string },
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.postsQueryRepository.getAllWithReactions(
      blogId,
      query,
      user?.userId,
    );
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogIdDto,
  ): Promise<PostViewDto | null> {
    const postId = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(blogId, body),
    );
    return await this.postsQueryRepository.getOneNoReactions(postId);
  }
}
