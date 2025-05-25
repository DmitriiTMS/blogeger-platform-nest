import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../schemas/post.schema';
import { Model, Types } from 'mongoose';
import { PostUpdateDto } from '../dto/post-update.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async save(post: PostDocument) {
    return post.save();
  }

  async update(
    id: string,
    postDto: PostUpdateDto,
  ): Promise<PostDocument | null> {
    return await this.PostModel.findOneAndUpdate(
      { _id: id },
      {
        title: postDto.title,
        shortDescription: postDto.shortDescription,
        content: postDto.content,
        blogId: postDto.blogId,
      },
    );
  }

  async delete(id: string): Promise<PostDocument | null> {
    return await this.PostModel.findByIdAndDelete(id);
  }
}
