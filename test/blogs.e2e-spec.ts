import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; 
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';


describe('BlogsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
  });

  it('/blogs/test', () => {
    return request(app.getHttpServer())
      .get('/blogs/test')
      .expect(200)
      .expect('hello');
  });
});
