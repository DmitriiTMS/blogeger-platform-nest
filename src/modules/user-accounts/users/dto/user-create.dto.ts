import { LoginApplyDecorator } from '../decorators/login.apply-decorator';
import { PasswordApplyDecorator } from '../decorators/password.apply-decoratot';
import { EmailApplyDecorator } from '../decorators/email.apply-decorator';

export class UserCreateDto {
  @LoginApplyDecorator(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @PasswordApplyDecorator()
  password: string;

  @EmailApplyDecorator(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
