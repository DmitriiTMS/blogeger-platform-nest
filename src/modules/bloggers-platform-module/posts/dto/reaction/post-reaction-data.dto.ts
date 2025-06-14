import { LikeStatus } from "../../schemas/extendedLikesInfo.schema"


export class PostDataReactionDto {
    status: LikeStatus
    postId: string
    userId: string
}