import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateBlogtDto } from '../dto/create-blog.dto';
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
  async getAll(): Promise<BlogViewDto[]> {
    const blogsDB = await this.blogsQueryRepository.getAll();
    const items = blogsDB.map((blog) => BlogViewDto.mapToView(blog));
    return items;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogtDto) {
    return await this.blogsService.createBlog(body);
  }
}
