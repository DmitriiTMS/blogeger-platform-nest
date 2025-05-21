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
  Res,
} from '@nestjs/common';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { BlogsService } from '../services/blogs.service';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { BlogViewDto } from '../dto/views-dto/blog.view-dto';
import { Blog } from '../schemas/blog.schema';
import type { Response } from 'express';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateAndUpdateBlogtDto): Promise<Blog> {
    return await this.blogsService.createBlog(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<BlogViewDto[]> {
    const blogsDB = await this.blogsQueryRepository.getAll();
    const items = blogsDB.map((blog) => BlogViewDto.mapToView(blog));
    return items;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneBlog(@Param('id') id: string): Promise<BlogViewDto | null> {
    const blog = await this.blogsQueryRepository.getOne(id);
    if (!blog) throw new NotFoundException(`Blog by ${id} not found`);
    return BlogViewDto.mapToView(blog);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOneBlog(
    @Param('id') id: string,
    @Body() body: CreateAndUpdateBlogtDto,
  ) {
    const blog = await this.blogsService.updateBlog(id, body);
    if (!blog) throw new NotFoundException(`Blog by ${id} not found`);
    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param('id') id: string, @Res() res: Response) {
    const blog = await this.blogsService.deleteBlog(id);
    if (!blog) throw new NotFoundException(`Blog by ${id} not found`);
    return { hh: 1233 };
  }
}
