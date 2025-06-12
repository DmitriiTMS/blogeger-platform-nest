import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostByBlogIdDto } from '../dto/create-post-by-blogId.dto';
import { PostsService } from '../../posts/services/posts.service';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { Types } from 'mongoose';

export class CreatePostByBlogIdCommand {
  constructor(
    public blogId: string,
    public postByBlogIdDto: CreatePostByBlogIdDto,
  ) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(private postsService: PostsService) {}

  async execute(command: CreatePostByBlogIdCommand): Promise<string> {
    if (!Types.ObjectId.isValid(command.blogId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `Invalid blog ID format`,
            field: 'blogId',
          },
        ],
      });
    }
    return await this.postsService.createPost({
      ...command.postByBlogIdDto,
      blogId: command.blogId,
    });
  }
}
