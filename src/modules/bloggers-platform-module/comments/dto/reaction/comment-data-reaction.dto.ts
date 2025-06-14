import { LikeStatus } from "../../schemas/comment-reaction.schema"

export class CommentDataReactionDto {
    status: LikeStatus
    commentId: string
    userId: string
}