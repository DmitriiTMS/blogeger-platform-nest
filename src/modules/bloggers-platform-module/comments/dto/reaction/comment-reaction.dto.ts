import { IsEnum, IsNotEmpty } from 'class-validator';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class CommentReactionDto {
  @IsEnum(LikeStatus, {
    message: `LikeStatus должен быть одним из: ${Object.values(LikeStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'LikeStatus обязателен к заполнению' })
  likeStatus: LikeStatus;
}
