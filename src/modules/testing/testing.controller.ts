import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../bloggers-platform-module/blogs/schemas/blog.schema';
import { Model } from 'mongoose';
import { Post } from '../bloggers-platform-module/posts/schemas/post.schema';
import { User } from '../user-accounts/users/schemas/users.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.blogModel.deleteMany();
    await this.postModel.deleteMany();
    await this.userModel.deleteMany();
    return;
  }
}
