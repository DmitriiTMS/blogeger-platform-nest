import { IsMongoId } from "class-validator";

export class PostReactionParamDto {
    @IsMongoId({message: 'CommentId is not Object Id'})
    postId: string
}