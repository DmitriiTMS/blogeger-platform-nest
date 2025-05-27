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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
