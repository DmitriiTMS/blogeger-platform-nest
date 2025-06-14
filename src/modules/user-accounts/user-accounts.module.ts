import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersController } from './users/controllers/users.controller';
import { UsersService } from './users/services/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/schemas/users.schema';
import { UsersRepository } from './users/repositories/users.repository';
import { UsersQueryRepository } from './users/repositories/users-query.repository';
import { AuthController } from './users/controllers/auth.controller';
import { AuthService } from './users/services/auth.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { SETTINGS } from '../../core/settings';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './users/strategies/local.strategy';
import {  JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './users/strategies/jwt.strategy';
import { AuthQueryRepository } from './users/repositories/auth-query.repository';
import {
  AccessToApi,
  AccessToApiSchema,
} from './users/schemas/access-to-api.schema';
import { ApiLoggerMiddleware } from './users/middlewares/apiLoggerMiddleware';
import { EmailService } from './users/other-services/email.service';
import { RefreshTokens, RefreshTokensSchema } from './users/schemas/refresh-token.schema';
import { RefreshTokenRepository } from './users/repositories/refresh-token.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AccessToApi.name, schema: AccessToApiSchema },
      { name: RefreshTokens.name, schema: RefreshTokensSchema },
    ]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
          user: SETTINGS.MAIL.EMAIL,
          pass: SETTINGS.MAIL.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // Только для тестов! В продакшене должно быть true
          minVersion: 'TLSv1.2',
          ciphers: 'SSLv3',
        },
      },
    }),
    PassportModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    {
      provide: SETTINGS.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: SETTINGS.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '5s' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    {
      provide: SETTINGS.REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: SETTINGS.REFRESH_TOKEN_SECRET,
          signOptions: { expiresIn: '10s' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthQueryRepository,
    EmailService,
    ApiLoggerMiddleware,
    RefreshTokenRepository
  ],
  exports: [UsersRepository],
})
export class UserAccountsModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(ApiLoggerMiddleware)
  //     .forRoutes(
  //       {path: 'auth/password-recovery', method: RequestMethod.POST},
  //       {path: 'auth/new-password', method: RequestMethod.POST},
  //       {path: 'auth/registration-confirmation', method: RequestMethod.POST},
  //       {path: 'auth/registration', method: RequestMethod.POST},
  //       {path: 'auth/registration-email-resending', method: RequestMethod.POST},
  //     );
  // }
}
