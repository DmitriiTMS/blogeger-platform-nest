import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
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

  it('/blogs (POST) create blog', async () => {
    const newBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    const response = await request(app.getHttpServer())
      .post('/blogs')
      .send(newBlog)
      .expect(HttpStatus.CREATED);

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
      .expect(HttpStatus.OK);

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

  it('/blogs/:id (GET) get one blog', async () => {
    const mockBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    const blog = await blogModel.create(mockBlog);

    const response = await request(app.getHttpServer())
      .get(`/blogs/${blog._id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: mockBlog.name,
      description: mockBlog.description,
      websiteUrl: mockBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('/blogs/:id (PUT) update one blog', async () => {
    const mockBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    const blog = await blogModel.create(mockBlog);

    const updateDto = {
      name: 'Updated Name',
      description: 'Updated Description',
      websiteUrl: 'https://updated.com',
    };

    await request(app.getHttpServer())
      .put(`/blogs/${blog._id}`)
      .send(updateDto)
      .expect(HttpStatus.NO_CONTENT);

    const updatedBlog = await blogModel.findById(blog._id);
    expect(updatedBlog!.name).toBe(updateDto.name);
    expect(updatedBlog!.description).toBe(updateDto.description);
    expect(updatedBlog!.websiteUrl).toBe(updateDto.websiteUrl);
  });

  it('/blogs/id (DELETE) delete one blog', async () => {
    const mockBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    const blog = await blogModel.create(mockBlog);

    await request(app.getHttpServer())
      .delete(`/blogs/${blog._id}`)
      .expect(HttpStatus.NO_CONTENT);

    const deletedBlog = await blogModel.findById(blog._id);
    expect(deletedBlog).toBeNull();
  });
});
