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
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { NewPasswordDto } from '../dto/new-password.dto';

const emailExamples = {
  registrationEmail(code: string) {
    return `<h1>Thank for your registration</h1>
             <p>To finish registration please follow the link below:<br>
                <a href='https://some-front.com/confirm-registration?code=${code}'>complete registration</a>
            </p>`;
  },
};

const emailPasswordRecovery = {
  passwordEmail(recoveryCode: string) {
    return `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
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

  async loginUser(userViewDto: UserViewDto): Promise<{ accessToken: string }> {
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

  async passwordRecovery(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new CustomDomainException({
        errorsMessages: `User by ${email} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const recoveryCode = randomUUID();

    this.mailService
      .sendMail({
        from: SETTINGS.MAIL.EMAIL,
        to: email,
        subject: 'Your code is here',
        html: emailPasswordRecovery.passwordEmail(recoveryCode),
      })
      .catch((er) => console.error('error in send email:', er));

    await this.usersRepository.updateUserСonfirmationCode(
      user._id.toString(),
      recoveryCode,
    );
  }

  async newPassword(newPasswordDto: NewPasswordDto) {
    const user = await this.usersRepository.findBYCodeEmail(
      newPasswordDto.recoveryCode,
    );
    if (!user) {
      throw new CustomDomainException({
        errorsMessages: `User by ${newPasswordDto.recoveryCode} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation recoveryCode expired',
            field: 'recoveryCode',
          },
        ],
      });
    }

    const passwordHash = await Bcrypt.generateHash(newPasswordDto.newPassword);
     await this.usersRepository.updateUserPassword(
      user._id.toString(),
      passwordHash
    );
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
