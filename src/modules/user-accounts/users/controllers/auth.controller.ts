import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthQueryRepository } from '../repositories/auth-query.repository';
import { UserGetMeViewDto } from '../dto/viewsDto/getMe-view.dto';
import { PasswordRecoveryDto } from '../dto/password-recovery.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';
import { RegistrationEmailEesendingDto } from '../dto/registration-email-resending.dto';
import { ExtractUserFromRequest } from '../decorators/extract-user-from-request.decorator';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  // async login(@Request() req): Promise<{ accessToken: string }> {
  async login(
    @ExtractUserFromRequest() user: UserViewDto,
    @Res({passthrough: true}) res: Response
   ): Promise<{ accessToken: string }> {

    const resultTokens = await this.authService.loginUser(user);
    res.cookie('refreshToken', resultTokens.refreshToken, {
      httpOnly: true,
      secure: true, // Для HTTPS
      sameSite: 'strict' // Защита от CSRF
    });
    return {accessToken: resultTokens.accessToken}
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryDto) {
    return await this.authService.passwordRecovery(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordDto) {
    return await this.authService.newPassword(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: RegistrationConfirmationDto) {
    return await this.authService.registrationConfirmation(body)
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: UserCreateDto) {
    return await this.authService.registerUser(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: RegistrationEmailEesendingDto) {
    return await this.authService.registrationEmailResending(body)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() req): Promise<UserGetMeViewDto> {
    return await this.authQueryRepository.getMe(req.user.userId);
  }
}
