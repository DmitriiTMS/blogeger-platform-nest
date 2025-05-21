import { Injectable} from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { Blog } from '../schemas/blog.schema';


@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: CreateAndUpdateBlogtDto): Promise<Blog> {
    return await this.blogsRepository.create(createBlogDto);
  }

  async updateBlog(id: string, blogDto: CreateAndUpdateBlogtDto): Promise<Blog | null> {
    return await this.blogsRepository.update(id, blogDto)
  }

   async deleteBlog(id: string): Promise<Blog | null> {
    return await this.blogsRepository.delete(id)
  }

}
