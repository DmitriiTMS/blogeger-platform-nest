import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SETTINGS } from '../../../../core/settings';
import { emailExamples, emailPasswordRecovery } from '../email/email-text';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async registerUserAndResendingEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      from: SETTINGS.MAIL.EMAIL,
      to: email,
      subject: 'Your code is here',
      html: emailExamples.registrationEmail(code),
    });
  }

  async passwordRecovery(email: string, recoveryCode: string) {
    await this.mailerService.sendMail({
      from: SETTINGS.MAIL.EMAIL,
      to: email,
      subject: 'Your code is here',
      html: emailPasswordRecovery.passwordEmail(recoveryCode),
    });
  }
}
