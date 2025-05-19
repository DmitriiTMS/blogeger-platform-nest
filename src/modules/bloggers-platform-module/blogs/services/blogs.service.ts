import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateBlogtDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsService {
    constructor(
        private blogsRepository: BlogsRepository
    ){}

    async createBlog(createBlogDto: CreateBlogtDto) {
        return await this.blogsRepository.create(createBlogDto)
    }
}
