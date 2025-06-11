import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../../modules/user-accounts/users/decorators/trim.decorator';

export class CreatePostByBlogIdDto {
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @Trim()
  shortDescription: string;

  @MaxLength(1000)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}
