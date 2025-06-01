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
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { emailExamples, emailPasswordRecovery } from '../email/email-text';
import { RegistrationEmailEesendingDto } from '../dto/registration-email-resending.dto';

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

    await Promise.all([
      this.usersService.createUser(userCreateDto, emailConfirmation),
      this.mailService.sendMail({
          from: SETTINGS.MAIL.EMAIL,
          to: userCreateDto.email,
          subject: 'Your code is here',
          html: emailExamples.registrationEmail(uuid),
        }).catch((er) => console.error('error in send email:', er)),
    ]);
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

    await Promise.all([
      this.usersRepository.updateUserСonfirmationCode(user._id.toString(),recoveryCode),
      this.mailService.sendMail({
        from: SETTINGS.MAIL.EMAIL,
        to: email,
        subject: 'Your code is here',
        html: emailPasswordRecovery.passwordEmail(recoveryCode),
      }).catch((er) => console.error('error in send email:', er))
    ])   
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
      passwordHash,
    );
  }

  async registrationConfirmation(regConfirmDto: RegistrationConfirmationDto) {
    const user = await this.usersRepository.findBYCodeEmail(regConfirmDto.code);
    if (!user) {
      throw new CustomDomainException({
        errorsMessages: `User by ${regConfirmDto.code} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation code confirmed',
            field: 'code',
          },
        ],
      });
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation recoveryCode expired',
            field: 'code',
          },
        ],
      });
    }

    await this.usersRepository.updateUserIsConfirmed(user._id.toString());
  }

  async registrationEmailResending(regEmailResDto: RegistrationEmailEesendingDto) {
    const user = await this.usersRepository.findByEmail(regEmailResDto.email);
    if (!user) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `User by ${regEmailResDto.email} not found`,
            field: 'email',
          },
        ],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: 'Confirmation code confirmed',
            field: 'email',
          },
        ],
      });
    }

    const newConfirmationCode = randomUUID();

    await Promise.all([
        this.usersRepository.updateUserСonfirmationCode(user._id.toString(),newConfirmationCode),
        this.mailService.sendMail({
            from: SETTINGS.MAIL.EMAIL,
            to: regEmailResDto.email,
            subject: 'Your code is here',
            html: emailExamples.registrationEmail(newConfirmationCode),
      }).catch((er) => console.error('error in send email:', er))
    ])    
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
