import { Module } from '@nestjs/common';
import { BloggersPlatformModule } from './modules/bloggers-platform-module/bloggers-platform.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/blogs_nest_db'),
    BloggersPlatformModule,
    UserAccountsModule,
    TestingModule,
  ],
})
export class AppModule {}
