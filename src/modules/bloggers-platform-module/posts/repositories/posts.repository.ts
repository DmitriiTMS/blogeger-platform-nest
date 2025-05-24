import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model, Types } from 'mongoose';
import { PostCreateDto } from '../dto/post-create.dto';
import { LikeStatus } from '../schemas/extendedLikesInfo.schema';
import { PostUpdateDto } from '../dto/post-update.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(
    createPostDto: PostCreateDto,
    blogName: string,
  ): Promise<PostDocument> {
    return await this.postModel.create({
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      blogName: blogName,
      // extendedLikesInfo: {},
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
      },
    });
  }

  async update(id: string, postDto: PostUpdateDto): Promise<PostDocument | null> {
    return await this.postModel.findOneAndUpdate(
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
    return await this.postModel.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
