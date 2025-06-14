import { CommentDeleteDataDto } from "./comment-delete-data.dto";

export class CommentUpdateDataDto extends CommentDeleteDataDto {
    content: string
}