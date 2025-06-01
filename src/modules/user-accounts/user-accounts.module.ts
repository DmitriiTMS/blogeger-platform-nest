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
import { SETTINGS } from 'src/core/settings';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './users/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './users/strategies/jwt.strategy';
import { AuthQueryRepository } from './users/repositories/auth-query.repository';
import {
  AccessToApi,
  AccessToApiSchema,
} from './users/schemas/access-to-api.schema';
import { ApiLoggerMiddleware } from './users/middlewares/apiLoggerMiddleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AccessToApi.name, schema: AccessToApiSchema },
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
    JwtModule.register({
      secret: SETTINGS.JWT_ACCESS_TOKEN,
      signOptions: { expiresIn: '6m' },
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuthQueryRepository,
    ApiLoggerMiddleware
  ],
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
