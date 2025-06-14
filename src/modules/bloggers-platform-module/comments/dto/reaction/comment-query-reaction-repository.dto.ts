import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommentReaction, CommentReactionModelType } from "../../schemas/comment-reaction.schema";

@Injectable()
export class CommentsQueryReactionsRepository {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionModel: CommentReactionModelType,
  ) {}

   async reactionForCommentIdAndUserId(commentId: string, userId: string) {
    return await this.commentReactionModel.findOne({ commentId, userId });
  }
}