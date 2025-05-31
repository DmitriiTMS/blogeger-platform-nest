import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  providers: [UsersService, UsersRepository, UsersQueryRepository, AuthService, LocalStrategy],
})
export class UserAccountsModule {}
