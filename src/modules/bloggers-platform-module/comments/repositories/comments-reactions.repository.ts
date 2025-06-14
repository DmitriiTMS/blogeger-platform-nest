import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentReaction,
  CommentReactionModelType,
  LikeStatus,
} from '../schemas/comment-reaction.schema';
import { CommentDataReactionDto } from '../dto/reaction/comment-data-reaction.dto';


@Injectable()
export class CommentsReactionsRepository {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionModel: CommentReactionModelType,
  ) {}

  async reactionForCommentIdAndUserId(commentId: string, userId: string) {
    return await this.commentReactionModel.findOne({ commentId, userId });
  }

  async saveInCommentReaction(dataReaction: CommentDataReactionDto) {
    return await this.commentReactionModel.insertOne(dataReaction);
  }

  async commentsLikeCount(commentId: string, status: LikeStatus.LIKE) {
    return await this.commentReactionModel.countDocuments({commentId, status});
  }

  async commentsDislikeCount(commentId: string, status: LikeStatus.DISLIKE) {
    return await this.commentReactionModel.countDocuments({commentId, status});
  }

   async updateCommentReaction(id: string, likeStatus:LikeStatus ) {
    return await this.commentReactionModel.updateOne(
      { _id: id },
      {
        $set: {
          status: likeStatus,
        },
      }
    );
  }
}
