import { IsMongoId } from "class-validator";

export class CommentIdReactionDto {
    @IsMongoId({message: 'CommentId is not Object Id'})
    commentId: string
}