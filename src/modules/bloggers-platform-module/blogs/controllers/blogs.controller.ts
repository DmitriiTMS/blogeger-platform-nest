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
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { BlogsService } from '../services/blogs.service';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { BlogViewDto } from '../dto/views-dto/blog.view-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<BlogViewDto[]> {
    return await this.blogsQueryRepository.getAll();
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
    return;
  }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async createPostByBlogId(@Body() body: CreateAndUpdateBlogtDto) {
  //   const blog = await this.blogsQueryRepository.getOne(id);
  //   if (!blog) throw new NotFoundException(`Blog by ${id} not found`);
  // }
}
