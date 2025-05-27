import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../schemas/post.schema';
import { Types } from 'mongoose';
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

  async delete(id: string) {
    const post = await this.PostModel.findById(id);
    if(!post) {
      throw new NotFoundException(`Post by ${id} not found`)
    }
    return await this.PostModel.deleteOne(new Types.ObjectId(id));
  }

  async findPost(id: string) {
    return await this.PostModel.findById(id);
  }
}
