import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { UsersService } from './users.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';
import { MailerService } from '@nestjs-modules/mailer';
import { SETTINGS } from 'src/core/settings';

const emailExamples = {
  registrationEmail(code: string) {
    return `<h1>Thank for your registration</h1>
             <p>To finish registration please follow the link below:<br>
                <a href='https://some-front.com/confirm-registration?code=${code}'>complete registration</a>
            </p>`;
  },
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private mailService: MailerService
  ) {}

  async registerUser(userCreateDto: UserCreateDto) {

    const uuid = randomUUID();
    const emailConfirmation = {
      confirmationCode: uuid,
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      isConfirmed: false,
    };

    await this.usersService.createUser(userCreateDto, emailConfirmation);

    this.mailService.sendMail({
      from: SETTINGS.MAIL.EMAIL,
      to: userCreateDto.email,
      subject: "Your code is here",
      html: emailExamples.registrationEmail(uuid)
    }).catch((er) => console.error("error in send email:", er));

  }
}
