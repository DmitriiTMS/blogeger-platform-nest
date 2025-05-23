import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async getAll(): Promise<PostDocument[]> {
    return await this.postModel.find();
  }

  async getOne(id: string): Promise<PostDocument | null> {
    return await this.postModel.findOne({ _id: new Types.ObjectId(id) });
  }
}
