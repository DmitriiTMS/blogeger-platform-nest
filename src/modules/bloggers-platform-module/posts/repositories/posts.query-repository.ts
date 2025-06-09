import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../schemas/post.schema';
import { Model, Types } from 'mongoose';
import { PostViewDto } from '../dto/view-dto/post.view-dto';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';
import { LikeStatus } from '../schemas/extendedLikesInfo.schema';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { Comment } from '../../comments/schemas/comments.schema';
import { CommentReaction, CommentReactionModelType } from '../../comments/schemas/comment-reaction.schema';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
     @InjectModel(CommentReaction.name) private commentReactionModel: CommentReactionModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async getAllPost(
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

  async getAllCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `Invalid blog ID format`,
            field: 'postId',
          },
        ],
      });
    }
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException(`Post by ${postId} not found`);

    const postIdsFromCommentsCollection = await this.commentModel.find({postId}).lean()
    const commentIds = postIdsFromCommentsCollection.map((item) => item._id.toString() )
    const allCommentsReactionWithUserIdAndCommentIds = await this.commentReactionModel
      .find({userId, commentId: {$in: commentIds}}).lean()
    const reactionDictionary = allCommentsReactionWithUserIdAndCommentIds.reduce((acc, reaction) => {
      return {
        ...acc,
        [reaction.commentId]: reaction.status,
      };
    }, {});
    
    const postsByIdByComments = (
      await this.commentModel
        .find({ postId })
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean()
    ).map(({ _id, postId, updatedAt, __v, ...result }) => {
   
      result.likesInfo.myStatus = reactionDictionary[_id.toString()] ?? LikeStatus.NONE

      return {
        id: _id.toString(),
        ...result,
      };
    });

    const countCommentsByPostId = await this.commentModel.countDocuments({postId});

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
    if (!Types.ObjectId.isValid(blogId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `Invalid blog ID format`,
            field: 'blogId',
          },
        ],
      });
    }
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
    if (!Types.ObjectId.isValid(id)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `Invalid blog ID format`,
            field: 'id',
          },
        ],
      });
    }
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
