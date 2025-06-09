import { Inject, Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { UsersService } from './users.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';
import { UsersRepository } from '../repositories/users.repository';
import { Bcrypt } from '../../../../utils/bcrypt';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';
import { JwtService } from '@nestjs/jwt';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { NewPasswordDto } from '../dto/new-password.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { RegistrationEmailEesendingDto } from '../dto/registration-email-resending.dto';
import { EmailService } from '../other-services/email.service';
import { SETTINGS } from '../../../../core/settings';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    @Inject(SETTINGS.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessJwtService: JwtService,
    @Inject(SETTINGS.REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshJwtService: JwtService,
  ) {}

  async loginUser(userViewDto: UserViewDto): Promise<{ accessToken: string, refreshToken: string }> {
    const accessToken = this.accessJwtService.sign({
      userId: userViewDto.id,
      userLogin: userViewDto.login,
    });

    const refreshToken =  this.refreshJwtService.sign({
      userId: userViewDto.id,
      deviceId: 'deviceId',
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async registerUser(userCreateDto: UserCreateDto) {
    const code = randomUUID();
    const emailConfirmation = {
      confirmationCode: code,
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      isConfirmed: false,
    };

    await this.usersService.createUser(userCreateDto, emailConfirmation);
    await this.emailService.registerUserAndResendingEmail(
      userCreateDto.email,
      code,
    );
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
    await this.usersRepository.updateUserСonfirmationCode(
      user._id.toString(),
      recoveryCode,
    );
    await this.emailService.passwordRecovery(email, recoveryCode);
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

  async registrationEmailResending(
    regEmailResDto: RegistrationEmailEesendingDto,
  ) {
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
    await this.usersRepository.updateUserСonfirmationCode(
      user._id.toString(),
      newConfirmationCode,
    );
    await this.emailService.registerUserAndResendingEmail(
      regEmailResDto.email,
      newConfirmationCode,
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
