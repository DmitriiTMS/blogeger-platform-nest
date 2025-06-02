import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../decorators/trim.decorator';
import { PasswordApplyDecorator } from '../decorators/password.apply-decoratot';

export class NewPasswordDto {
  @PasswordApplyDecorator()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  recoveryCode: string;
}
