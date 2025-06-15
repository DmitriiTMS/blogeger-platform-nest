import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { UsersService } from './users.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';

import { Bcrypt } from '../../../../utils/bcrypt';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { NewPasswordDto } from '../dto/new-password.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { RegistrationEmailEesendingDto } from '../dto/registration-email-resending.dto';
import { EmailService } from '../other-services/email.service';
import { SETTINGS } from '../../../../core/settings';
import { RefreshTokenRepository } from '../repositories/refresh-token/refresh-token.repository';
import { UsersRepository } from '../repositories/users/users.repository';
import { DevicesRepository } from '../repositories/devices/devices.repository';

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
    private refreshTokenRepository: RefreshTokenRepository,
    private devicesRepository: DevicesRepository,
  ) {}

  async loginUser(
    userViewDto: UserViewDto,
    infoDevice: { ip?: string; title?: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.accessJwtService.sign({
      userId: userViewDto.id,
      userLogin: userViewDto.login,
    });

    const deviceId = randomUUID();
    const refreshToken = this.refreshJwtService.sign({
      userId: userViewDto.id,
      userLogin: userViewDto.login,
      deviceId: deviceId,
    });

    await this.refreshTokenRepository.addRefreshToken({ refreshToken });
    await this.createDeviceUsers(refreshToken,infoDevice.ip!,infoDevice.title!);

    return {
      accessToken,
      refreshToken,
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

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не передан в cookies');
    }

    const verifyRefreshToken = await this.verifyRefreshToken(refreshToken);

    const newAccessToken = this.accessJwtService.sign({
      userId: verifyRefreshToken.userId,
      userLogin: verifyRefreshToken.userLogin,
    });

    const newRefreshToken = this.refreshJwtService.sign({
      userId: verifyRefreshToken.userId,
      userLogin: verifyRefreshToken.userLogin,
      deviceId: verifyRefreshToken.deviceId,
    });

    const token =
      await this.refreshTokenRepository.findByRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('REFRESH_TOKEN_NOT_FOUND');
    }

    await this.refreshTokenRepository.deleteRefreshToken(token._id.toString());
    await this.refreshTokenRepository.addRefreshToken({
      refreshToken: newRefreshToken,
    });

    return { newAccessToken, newRefreshToken };

    // const decodeRefreshToken = await jwtService.decodeToken(refreshToken);
    // const tokenInDb = await refreshTokensRepository.findByDevice(
    //   decodeRefreshToken.deviceId
    // );
    // if (!tokenInDb) {
    //   res.sendStatus(SETTINGS.HTTP_STATUS.UNAUTHORIZATION);
    //   return;
    // }

    // const decodeNewRefreshToken = await jwtService.decodeToken(newRefreshToken);
    // await refreshTokensRepository.updateSessionLastActiveDate(
    //   decodeRefreshToken.deviceId!,
    //   refreshToken, // старый refreshToken (для проверки)
    //   newRefreshToken, // новый refreshToken
    //   new Date(decodeNewRefreshToken.iat! * 1000).toISOString() // новое lastActiveDate
    // );
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не передан в cookies');
    }

    await this.verifyRefreshToken(refreshToken);

    const token =
      await this.refreshTokenRepository.findByRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('REFRESH_TOKEN_NOT_FOUND');
    }

    await this.refreshTokenRepository.deleteRefreshToken(token._id.toString());
  }

  async createDeviceUsers(refreshToken: string, ip: string, title: string) {
    const decodeRefreshToken = await this.verifyRefreshToken(refreshToken);

    if (!ip || !title) {
      throw new BadRequestException('IP или title не переданы');
    }

    const session = {
      ip: ip === '::1' ? '127.0.0.1' : ip,
      title,
      lastActiveDate: new Date(decodeRefreshToken.iat! * 1000).toISOString(),
      deviceId: decodeRefreshToken?.deviceId,
      userId: decodeRefreshToken.userId,
      refreshToken,
    };

    await this.devicesRepository.createSession(session);
    return true;
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      // 1. Проверяем токен
      const decodeRefreshToken =
        await this.refreshJwtService.verify(refreshToken);

      // 2. Проверяем payload - ОПЦИОНАЛЬНО!!!!!!
      if (!decodeRefreshToken?.userId || !decodeRefreshToken?.userLogin) {
        throw new UnauthorizedException('INVALID_TOKEN_PAYLOAD');
      }
      return decodeRefreshToken;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
      }
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }
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
