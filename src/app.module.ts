import { Module } from '@nestjs/common';
import { BloggersPlatformModule } from './modules/bloggers-platform-module/bloggers-platform.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './modules/testing/testing.module';
import { APP_FILTER } from '@nestjs/core';
import { CustomDomainHttpExceptionsFilter } from './setup/exceptions/filters/custom-domain-exceptions.filter';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/blogs_nest_db'),
    BloggersPlatformModule,
    UserAccountsModule,
    TestingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomDomainHttpExceptionsFilter,
    }
  ],
})
export class AppModule {}
