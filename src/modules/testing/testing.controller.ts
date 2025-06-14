import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../bloggers-platform-module/blogs/schemas/blog.schema';
import { Model } from 'mongoose';
import { Post } from '../bloggers-platform-module/posts/schemas/post.schema';
import { User } from '../user-accounts/users/schemas/users.schema';
import { AccessToApi } from '../user-accounts/users/schemas/access-to-api.schema';
import { Comment } from '../bloggers-platform-module/comments/schemas/comments.schema';
import { CommentReaction } from '../bloggers-platform-module/comments/schemas/comment-reaction.schema';
import { PostReaction } from '../bloggers-platform-module/posts/schemas/post-reaction.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(AccessToApi.name) private accessToApiModel: Model<AccessToApi>,
    @InjectModel(CommentReaction.name) private commentReaction: Model<CommentReaction>,
    @InjectModel(PostReaction.name) private postReaction: Model<PostReaction>,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.blogModel.deleteMany();
    await this.postModel.deleteMany();
    await this.userModel.deleteMany();
    await this.commentModel.deleteMany();
    await this.accessToApiModel.deleteMany();
    await this.commentReaction.deleteMany();
    await this.postReaction.deleteMany();
    return;
  }
}
