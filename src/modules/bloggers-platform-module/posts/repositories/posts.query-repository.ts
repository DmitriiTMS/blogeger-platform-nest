import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { PostViewDto } from '../dto/view-dto/post.view-dto';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';
import { LikeStatus } from '../schemas/extendedLikesInfo.schema';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { Comment } from '../../comments/schemas/comments.schema';


@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
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

    const postsByIdByComments = (
      await this.commentModel
        .find({ postId })
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean()
    ).map(({ _id, postId, updatedAt, __v, ...result }) => ({
      id: _id.toString(), // Преобразуем ObjectId в строку
      ...result,
    }));

    const countCommentsByPostId = await this.commentModel.countDocuments({
      postId,
    });

    return PaginatedViewDto.mapToView({
      items: [...postsByIdByComments],
      totalCount: countCommentsByPostId,
      page: postsByIdByComments.length > 0 ? query.pageNumber : 0,
      size: postsByIdByComments.length > 0 ? query.pageSize : 0,
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
