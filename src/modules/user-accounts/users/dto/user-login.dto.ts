import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../decorators/trim.decorator';

export class UserLoginDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  password: string;
}
