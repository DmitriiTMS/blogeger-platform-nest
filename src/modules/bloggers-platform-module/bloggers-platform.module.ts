import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/schemas/blog.schema';
import { BlogsController } from './blogs/controllers/blogs.controller';
import { BlogsService } from './blogs/services/blogs.service';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
import { BlogsQueryRepository } from './blogs/repositories/blogs.query-repository';
import { PostsService } from './posts/services/posts.service';
import { PostsController } from './posts/controllers/posts.controller';
import { PostsRepository } from './posts/repositories/posts.repository';
import { Post, PostSchema } from './posts/schemas/post.schema';
import { PostsQueryRepository } from './posts/repositories/posts.query-repository';
import { CommentsController } from './comments/controllers/comments.controller';
import { CommentsService } from './comments/services/comments.service';
import { CommentsRepository } from './comments/repositories/comments.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { Comment, CommentSchema } from './comments/schemas/comments.schema';
import {
  CommentReaction,
  CommentReactionSchema,
} from './comments/schemas/comment-reaction.schema';
import { CommentsReactionsRepository } from './comments/repositories/comments-reactions.repository';
import { SETTINGS } from '../../core/settings';
import { JwtService } from '@nestjs/jwt';
import { CommentsQueryReactionsRepository } from './comments/dto/reaction/comment-query-reaction-repository.dto';
import { PostReaction, PostReactionSchema } from './posts/schemas/post-reaction.schema';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsCreateUseCase } from './blogs/useCases/blog-create-use-case';
import { BlogsUpdateUseCase } from './blogs/useCases/blog-update-use-case';
import { BlogsDeleteUseCase } from './blogs/useCases/blog-delete-use-case';
import { CreatePostByBlogIdUseCase } from './blogs/useCases/create-post-by-blogId';


const services = [BlogsService, PostsService, CommentsService];

const useCases = [BlogsCreateUseCase, BlogsUpdateUseCase, BlogsDeleteUseCase, CreatePostByBlogIdUseCase]

@Module({
  imports: [
    CqrsModule.forRoot(),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
      { name: PostReaction.name, schema: PostReactionSchema },
    ]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...services,
    {
      provide: SETTINGS.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: SETTINGS.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '5m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsReactionsRepository,
    CommentsQueryReactionsRepository,
    ...useCases
  ],
})
export class BloggersPlatformModule {}
