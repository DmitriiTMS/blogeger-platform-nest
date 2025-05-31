import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { PostViewDto } from '../dto/view-dto/post.view-dto';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';
import { LikeStatus } from '../schemas/extendedLikesInfo.schema';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private blogsRepository: BlogsRepository,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const listReactions = [
      { addedAt: '2025-05-25T06:11:54.055Z', userId: 'userId', login: 'login' },
    ];
    const postsDB = await this.postModel
      .find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.postModel.countDocuments();
    // запрос к статусу в бд
    const status = LikeStatus.NONE;

    const items = postsDB.map((post) =>
      PostViewDto.mapToView(post, listReactions, status),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAllCommentsByPostId(postId: string, query: GetPostsQueryParams) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException(`Post by ${postId} not found`);

    const postsDB = await this.postModel
      .find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const comments = [
      {
        id: 'string',
        content: 'string',
        commentatorInfo: {
          userId: 'string',
          userLogin: 'string',
        },
        createdAt: '2025-05-25T12:55:25.447Z',
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      },
    ];

    // const totalCount = await this.postModel.countDocuments();
    const totalCount = comments.length;

    const items = [...comments];

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAllWithReactions(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const blog = await this.blogsRepository.getOne(blogId);
    if (!blog) throw new NotFoundException(`Blog by ${blogId} not found`);

    const listReactions = [
      { addedAt: '2025-05-25T06:11:54.055Z', userId: 'userId', login: 'login' },
    ];

    const postsDB = await this.postModel
      .find({ blogId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.postModel.countDocuments({ blogId });
    // запрос к статусу в бд
    const status = LikeStatus.NONE;

    const items = postsDB.map((post) =>
      PostViewDto.mapToView(post, listReactions, status),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getOneWithReactions(id: string): Promise<PostViewDto> {
    const listReactions = [
      { addedAt: '2025-05-25T06:11:54.055Z', userId: 'userId', login: 'login' },
    ];
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new CustomDomainException({
        errorsMessages: `Post by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    // запрос к статусу в бд
    const status = LikeStatus.NONE;

    return PostViewDto.mapToView(post, listReactions, status);
  }
}
