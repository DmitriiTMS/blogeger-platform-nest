import { EmailApplyDecorator } from '../decorators/email.apply-decorator';

export class PasswordRecoveryDto {
  @EmailApplyDecorator(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
