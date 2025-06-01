import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { UsersService } from './users.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';
import { MailerService } from '@nestjs-modules/mailer';
import { SETTINGS } from 'src/core/settings';
import { UsersRepository } from '../repositories/users.repository';
import { Bcrypt } from 'src/utils/bcrypt';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';
import { JwtService } from '@nestjs/jwt';

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
    private mailService: MailerService,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async loginUser(userViewDto: UserViewDto) {
    const accessToken = this.jwtService.sign({
      userId: userViewDto.id,
      userLogin: userViewDto.login,
    });
    return {
      accessToken,
    };
  }

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

    this.mailService
      .sendMail({
        from: SETTINGS.MAIL.EMAIL,
        to: userCreateDto.email,
        subject: 'Your code is here',
        html: emailExamples.registrationEmail(uuid),
      })
      .catch((er) => console.error('error in send email:', er));
  }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserViewDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordValid = await Bcrypt.comparePasswords({
      password,
      hash: user.hashPassword,
    });
    if (!isPasswordValid) {
      return null;
    }

    const userView = UserViewDto.mapToView(user);
    return userView;
  }
}
