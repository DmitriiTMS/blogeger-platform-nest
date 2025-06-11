import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../schemas/post.schema';
import { Types } from 'mongoose';
import { PostUpdateDto } from '../dto/post-update.dto';
import { PostDataReactionDto } from '../dto/reaction/post-reaction-data.dto';
import {
  LikeStatus,
  PostReaction,
  PostReactionModelType,
} from '../schemas/post-reaction.schema';

export type LikePostResponse = {
  _id: Types.ObjectId;
  postId: string;
  userId: string | null;
  status: LikeStatus;
  createdAt: Date;
};

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(PostReaction.name)
    private postReactionModel: PostReactionModelType,
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
    if (!post) {
      throw new NotFoundException(`Post by ${id} not found`);
    }
    return await this.PostModel.deleteOne(new Types.ObjectId(id));
  }

  async findPost(id: string) {
    return await this.PostModel.findById(id);
  }

  async saveInPostReaction(postDataReactionDto: PostDataReactionDto) {
    await this.postReactionModel.create(postDataReactionDto);
  }

  async reactionForPostIdAndUserId(postId: string, userId: string) {
    return await this.postReactionModel.findOne({ postId, userId });
  }

  async postsLikeCount(postId: string, status: LikeStatus.LIKE) {
    return await this.postReactionModel.countDocuments({ postId, status });
  }

  async postsDislikeCount(postId: string, status: LikeStatus.DISLIKE) {
    return await this.postReactionModel.countDocuments({ postId, status });
  }

  async likeCountUpdate(postId: string, count: number) {
    return await this.PostModel.updateOne(
      { _id: postId },
      {
        $set: {
          'extendedLikesInfo.likesCount': count,
        },
      },
    );
  }

  async dislikeCountUpdate(postId: string, count: number) {
    return await this.PostModel.updateOne(
      { _id: postId },
      {
        $set: {
          'extendedLikesInfo.dislikesCount': count,
        },
      },
    );
  }

  async updatePostReaction(id: string, likeStatus: LikeStatus) {
    return await this.postReactionModel.updateOne(
      { _id: id },
      {
        $set: {
          status: likeStatus,
        },
      },
    );
  }

  async findManyReactionByUserIdAndPostId(
    userId: string,
    postIds: string[],
  ): Promise<LikePostResponse[]> {
    return await this.postReactionModel.find({
      userId,
      postId: { $in: postIds },
    });
  }

  async findAllLikeByPostIds(
    status: LikeStatus.LIKE,
    postIds: string[],
  ): Promise<LikePostResponse[]> {
    return (await this.postReactionModel
      .find({ status, postId: { $in: postIds } })
      .sort({ _id: -1 })
      .limit(3)
      .lean()
      .exec()) as unknown as LikePostResponse[];
  }

  async findAllLikesByPostId(
    status: LikeStatus.LIKE,
    postId: string,
  ): Promise<LikePostResponse[]> {
    return (await this.postReactionModel
      .find({ status, postId })
      .sort({ _id: -1 })
      .limit(3)
      .lean()
      .exec()) as unknown as LikePostResponse[];
  }
}
