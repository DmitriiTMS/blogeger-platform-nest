import { Injectable} from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { Blog, BlogDocument } from '../schemas/blog.schema';


@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: CreateAndUpdateBlogtDto): Promise<BlogDocument> {
    //const newBlog:BlogModel = blogModel.createBlog(createBlogDto)
    // awaut thos.blogrepo.save(newBlog)
    return await this.blogsRepository.create(createBlogDto);
  }

  async updateBlog(id: string, blogDto: CreateAndUpdateBlogtDto): Promise<BlogDocument | null> {
    //const targetBlog = this.blogrRepo.findById(id)
    // targetBlog.update(blogDto)
   // awaut thos.blogrepo.save(newBlog)
    return await this.blogsRepository.update(id, blogDto)
  }

async deleteContetn(id:string) {
 //const targetBlog = this.blogrRepo.findById(id)
    // targetBlog.deleteConent()
   // awaut thos.blogrepo.save(newBlog)
}

   async deleteBlog(id: string): Promise<BlogDocument | null> {
     //const targetBlog = this.blogrRepo.findById(id)
    // targetBlog.delete()
   // awaut thos.blogrepo.save(newBlog)
    return await this.blogsRepository.delete(id)
  }

}
