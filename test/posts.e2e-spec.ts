import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Post } from '../src/modules/bloggers-platform-module/posts/schemas/post.schema';
import { Blog } from '../src/modules/bloggers-platform-module/blogs/schemas/blog.schema';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  let postModel: Model<Post>;
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
    postModel = moduleFixture.get<Model<Post>>(getModelToken(Post.name));
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

  it('/posts (GET) get all posts', async () => {
    const mockBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };

    const blog = await blogModel.create(mockBlog);
    const newPost = {
      title: 'title 1',
      shortDescription: 'shortDescription 1',
      content: 'content 1',
      blogId: blog._id.toString(),
    };

    await request(app.getHttpServer())
      .post('/posts')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    const getResponse = await request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({
      totalCount: 1,
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      items: [
        {
          id: expect.any(String),
          title: newPost.title,
          shortDescription: newPost.shortDescription,
          content: newPost.content,
          blogId: blog._id.toString(),
          blogName: blog.name,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [
              {
                addedAt: '2025-05-25T06:11:54.055Z',
                userId: 'userId',
                login: 'login',
              },
            ],
          },
        },
      ],
    });
  });

  it('/posts (POST) create post', async () => {
    const mockBlog = {
      name: 'blog 1',
      description: 'description 1',
      websiteUrl: 'https://site.examples.ru',
    };
    const blog = await blogModel.create(mockBlog);

    const newPost = {
      title: 'title 1',
      shortDescription: 'shortDescription 1',
      content: 'content 1',
      blogId: blog._id.toString(),
    };

    const response = await request(app.getHttpServer())
      .post('/posts')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      id: expect.any(String),
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [
          {
            addedAt: '2025-05-25T06:11:54.055Z',
            userId: 'userId',
            login: 'login',
          },
        ],
      },
    });
  });
});
