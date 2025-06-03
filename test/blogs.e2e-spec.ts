import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Blog } from '../src/modules/bloggers-platform-module/blogs/schemas/blog.schema';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  let blogModel: Model<Blog>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    // Получаем подключение к базе данных
    connection = moduleFixture.get<Connection>(getConnectionToken());
    blogModel = moduleFixture.get<Model<Blog>>(getModelToken(Blog.name));

  });

  beforeEach(async () => {
    // Очистка всех коллекций перед каждым тестом
    const collections = await connection.db?.listCollections().toArray();
    for (const collection of collections!) {
      await connection.db?.collection(collection.name).deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('/blogs/test', () => {
    return request(app.getHttpServer())
      .get('/blogs/test')
      .expect(200)
      .expect('hello');
  });

  it('/blogs (POST) create blog', async () => {
    const newBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    const response = await request(app.getHttpServer())
      .post('/blogs')
      .send(newBlog)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('/blogs (GET) get all blogs', async () => {
    const mockBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    await blogModel.create(mockBlog);

    const response = await request(app.getHttpServer())
      .get('/blogs')
      .expect(200);

    expect(response.body).toEqual({
      totalCount: 1,
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      items: [
        {
          id: expect.any(String),
          name: 'blog 1',
          description: 'description 1',
          websiteUrl: 'https://site.examples.ru',
          createdAt: expect.any(String),
          isMembership: false,
        },
      ],
    });
  });
});
