
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../schemas/blog.schema';
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BlogsCreateCommand {
  constructor(public createBlogDto: CreateAndUpdateBlogtDto) {}
}

@CommandHandler(BlogsCreateCommand)
export class BlogsCreateUseCase implements ICommandHandler<BlogsCreateCommand> {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BlogsCreateCommand): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: command.createBlogDto.name,
      description: command.createBlogDto.description,
      websiteUrl: command.createBlogDto.websiteUrl,
    });
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }
}
