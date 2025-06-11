import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
} from '../bloggers-platform-module/blogs/schemas/blog.schema';
import {
  Post,
  PostSchema,
} from '../bloggers-platform-module/posts/schemas/post.schema';
import { User, UserSchema } from '../user-accounts/users/schemas/users.schema';
import {
  AccessToApi,
  AccessToApiSchema,
} from '../user-accounts/users/schemas/access-to-api.schema';
import { Comment, CommentSchema } from '../bloggers-platform-module/comments/schemas/comments.schema';
import { CommentReaction, CommentReactionSchema } from '../bloggers-platform-module/comments/schemas/comment-reaction.schema';
import { PostReaction, PostReactionSchema } from '../bloggers-platform-module/posts/schemas/post-reaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: AccessToApi.name, schema: AccessToApiSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
      { name: PostReaction.name, schema: PostReactionSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
