
import { BlogsRepository } from '../repositories/blogs.repository';
import { CreateAndUpdateBlogtDto } from '../dto/createAndUpdate-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BlogsUpdateCommand {
  constructor(
    public id: string,
    public blogDto: CreateAndUpdateBlogtDto,
  ) {}
}

@CommandHandler(BlogsUpdateCommand)
export class BlogsUpdateUseCase implements ICommandHandler<BlogsUpdateCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BlogsUpdateCommand) {
    const blog = await this.blogsRepository.getByIdOrNotFoundFail(command.id);
    blog.update(command.blogDto);
    await this.blogsRepository.save(blog);
  }
}
