import { BlogsRepository } from '../repositories/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BlogsDeleteCommand {
  constructor(public id: string) {}
}

@CommandHandler(BlogsDeleteCommand)
export class BlogsDeleteUseCase implements ICommandHandler<BlogsDeleteCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BlogsDeleteCommand) {
    await this.blogsRepository.delete(command.id);
  }
}
