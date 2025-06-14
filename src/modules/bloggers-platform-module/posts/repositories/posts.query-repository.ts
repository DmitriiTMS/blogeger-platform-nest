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
import {
  CommentReaction,
  CommentReactionModelType,
} from '../../comments/schemas/comment-reaction.schema';
import { PostsRepository } from './posts.repository';
import { UsersRepository } from '../../../../modules/user-accounts/users/repositories/users.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(CommentReaction.name)
    private commentReactionModel: CommentReactionModelType,
    private blogsRepository: BlogsRepository,
    private postRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  // async getAllPost(
  //   query: GetPostsQueryParams,
  //   userId: string,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   const postsDB = await this.postModel
  //     .find()
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);

  //   const postIds = postsDB.map((p) => p._id.toString());

  //   //Получение любых реакций
  //   const postsReactions =
  //     await this.postRepository.findManyReactionByUserIdAndPostId(
  //       userId,
  //       postIds,
  //     );
  //   const reactionDictionary = postsReactions.reduce((acc, reaction) => {
  //     return {
  //       ...acc,
  //       [reaction.postId]: reaction.status,
  //     };
  //   }, {});

  //   // Получение последних 3 лайков для каждого поста (уже отсортированных по дате)
  //   const postsLikeReaction = await this.postRepository.findAllLikeByPostIds(
  //     LikeStatus.LIKE,
  //     postIds,
  //   );

  //   // Получение login user
  //   const uniqueUserIds = [
  //     ...new Set(
  //       postsLikeReaction.map((item) => item.userId?.toString() || ''),
  //     ),
  //   ];
  //   const loginsUsers =
  //     await this.usersRepository.findUsersByUserIds(uniqueUserIds);
  //   const userIdToLoginMap = loginsUsers.reduce((acc, user) => {
  //     acc[user.id] = user.login;
  //     return acc;
  //   }, {});

  //   const reactionDictionaryLIKE = postsLikeReaction.reduce((acc, reaction) => {
  //     const postId = reaction.postId;
  //     const userId = reaction.userId?.toString();

  //     if (!userId) return acc; // пропускаем если нет userId

  //     if (!acc[postId]) {
  //       acc[postId] = [];
  //     }

  //     acc[postId].push({
  //       userId: userId,
  //       login: userIdToLoginMap[userId] || 'deleted', // или 'unknown' если пользователь не найден
  //       addedAt: reaction.createdAt.toISOString,
  //     });

  //     return acc;
  //   }, {});

  //   const items = postsDB.map((post) => {
  //     post.extendedLikesInfo.myStatus = reactionDictionary[post._id.toString()] ?? LikeStatus.NONE;
  //     post.extendedLikesInfo.newestLikes = reactionDictionaryLIKE[post._id.toString()] ?? [];
  //     return PostViewDto.mapToView(
  //       post,
  //       post.extendedLikesInfo.newestLikes,
  //       post.extendedLikesInfo.myStatus,
  //     );
  //   });

  //   const totalCount = await this.postModel.countDocuments();
  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }

  async getAllPost(
    query: GetPostsQueryParams,
    userId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const postsDB = await this.postModel
      .find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const postIds = postsDB.map((p) => p._id.toString());

    // Получаем реакции текущего пользователя
    const postsReactions =
      await this.postRepository.findManyReactionByUserIdAndPostId(
        userId,
        postIds,
      );
    const reactionDictionary = postsReactions.reduce((acc, reaction) => {
      return {
        ...acc,
        [reaction.postId]: reaction.status,
      };
    }, {});

    // Получаем последние 3 лайка для каждого поста
    const postsLikeReaction = await this.postRepository.findAllLikeByPostIds(
      LikeStatus.LIKE,
      postIds,
    );

    // Группируем лайки по postId
    const likesByPostId = postsLikeReaction.reduce((acc, reaction) => {
      if (!acc[reaction.postId]) {
        acc[reaction.postId] = [];
      }
      acc[reaction.postId].push(reaction);
      return acc;
    }, {});

    // Получаем логины пользователей
    const userIds = [
      ...new Set(postsLikeReaction.map((r) => r.userId!.toString())),
    ];
    const users = await this.usersRepository.findUsersByUserIds(userIds);
    const userLoginMap = users.reduce((acc, user) => {
      acc[user.id] = user.login;
      return acc;
    }, {});

    // Формируем items
    const items = postsDB.map((post) => {
      const postId = post._id.toString();
      const newestLikes = (likesByPostId[postId] || [])
        .slice(0, 3) // Берем только 3 последних
        .map((like) => ({
          addedAt: like.createdAt.toISOString(),
          userId: like.userId.toString(),
          login: userLoginMap[like.userId.toString()] || 'deleted',
        }));

      return PostViewDto.mapToView(
        post,
        newestLikes,
        reactionDictionary[postId] ?? LikeStatus.NONE,
      );
    });

    const totalCount = await this.postModel.countDocuments();
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  // async getAllWithReactions(
  //   blogId: string,
  //   query: GetPostsQueryParams,
  //   userId: string,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   if (!Types.ObjectId.isValid(blogId)) {
  //     throw new CustomDomainException({
  //       errorsMessages: [
  //         {
  //           message: `Invalid blog ID format`,
  //           field: 'blogId',
  //         },
  //       ],
  //     });
  //   }
  //   const blog = await this.blogsRepository.getOne(blogId);
  //   if (!blog) throw new NotFoundException(`Blog by ${blogId} not found`);

  //   const postsAllWithBlogId = await this.postModel
  //     .find({ blogId })
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);

  //   const postIds = postsAllWithBlogId.map((p) => p._id.toString());

  //   //Получение любых реакций
  //   const postsReactions =
  //     await this.postRepository.findManyReactionByUserIdAndPostId(
  //       userId,
  //       postIds,
  //     );
  //   const reactionDictionary = postsReactions.reduce((acc, reaction) => {
  //     return {
  //       ...acc,
  //       [reaction.postId]: reaction.status,
  //     };
  //   }, {});

  //   const postsLikeReaction = await this.postRepository.findAllLikeByPostIds(
  //     LikeStatus.LIKE,
  //     postIds,
  //   );

  //   // Получение login user
  //   const uniqueUserIds = [
  //     ...new Set(
  //       postsLikeReaction.map((item) => item.userId?.toString() || ''),
  //     ),
  //   ];
  //   const loginsUsers =
  //     await this.usersRepository.findUsersByUserIds(uniqueUserIds);
  //   const userIdToLoginMap = loginsUsers.reduce((acc, user) => {
  //     acc[user.id] = user.login;
  //     return acc;
  //   }, {});
  //   const reactionDictionaryLIKE = postsLikeReaction.reduce((acc, reaction) => {
  //     const postId = reaction.postId;
  //     const userId = reaction.userId?.toString();

  //     if (!userId) return acc; // пропускаем если нет userId

  //     if (!acc[postId]) {
  //       acc[postId] = [];
  //     }

  //     acc[postId].push({
  //       userId: userId,
  //       login: userIdToLoginMap[userId] || 'deleted', // или 'unknown' если пользователь не найден
  //       addedAt: reaction.createdAt.toISOString,
  //     });

  //     return acc;
  //   }, {});

  //   const items = postsAllWithBlogId.map((post) => {
  //     post.extendedLikesInfo.myStatus =
  //       reactionDictionary[post._id.toString()] ?? LikeStatus.NONE;
  //     post.extendedLikesInfo.newestLikes =
  //       reactionDictionaryLIKE[post._id.toString()] ?? [];
  //     return PostViewDto.mapToView(
  //       post,
  //       post.extendedLikesInfo.newestLikes,
  //       post.extendedLikesInfo.myStatus,
  //     );
  //   });

  //   const totalCount = await this.postModel.countDocuments({ blogId });

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }

  async getAllWithReactions(
    blogId: string,
    query: GetPostsQueryParams,
    userId: string,
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

    const postsAllWithBlogId = await this.postModel
      .find({ blogId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const postIds = postsAllWithBlogId.map((p) => p._id.toString());

    // Получение реакций текущего пользователя
    const postsReactions =
      await this.postRepository.findManyReactionByUserIdAndPostId(
        userId,
        postIds,
      );
    const reactionDictionary = postsReactions.reduce((acc, reaction) => {
      return {
        ...acc,
        [reaction.postId]: reaction.status,
      };
    }, {});

    // Получение последних лайков для каждого поста
    const postsLikeReaction = await this.postRepository.findAllLikeByPostIds(
      LikeStatus.LIKE,
      postIds,
    );

    // Группируем лайки по postId
    const likesByPostId = postsLikeReaction.reduce((acc, reaction) => {
      if (!acc[reaction.postId]) {
        acc[reaction.postId] = [];
      }
      acc[reaction.postId].push(reaction);
      return acc;
    }, {});

    // Получаем логины пользователей
    const userIds = [
      ...new Set(postsLikeReaction.map((r) => r.userId!.toString())),
    ];
    const users = await this.usersRepository.findUsersByUserIds(userIds);
    const userLoginMap = users.reduce((acc, user) => {
      acc[user.id] = user.login;
      return acc;
    }, {});

    // Формируем items
    const items = postsAllWithBlogId.map((post) => {
      const postId = post._id.toString();
      const newestLikes = (likesByPostId[postId] || [])
        .slice(0, 3) // Берем только 3 последних
        .map((like) => ({
          addedAt: like.createdAt.toISOString(), // Добавляем поле addedAt
          userId: like.userId.toString(),
          login: userLoginMap[like.userId.toString()] || 'deleted',
        }));

      return PostViewDto.mapToView(
        post,
        newestLikes,
        reactionDictionary[postId] ?? LikeStatus.NONE,
      );
    });

    const totalCount = await this.postModel.countDocuments({ blogId });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getOneWithReactions(id: string, userId?: string): Promise<PostViewDto> {
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

    const post = await this.postModel.findById(id);
    if (!post) {
      throw new CustomDomainException({
        errorsMessages: `Post by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    let userStatus = LikeStatus.NONE;
    if (userId) {
      const reactionUser = await this.postRepository.reactionForPostIdAndUserId(
        id,
        userId,
      );
      userStatus = reactionUser?.status || LikeStatus.NONE;
    }

    const postsLikeReaction = await this.postRepository.findAllLikesByPostId(
      LikeStatus.LIKE,
      id,
    );
    const userIds = postsLikeReaction.map(
      (item) => item.userId?.toString() || '',
    );

    const loginsUsers = await this.usersRepository.findUsersByUserIds(userIds);
    const userIdToLoginMap = loginsUsers.reduce((acc, user) => {
      acc[user.id] = user.login;
      return acc;
    }, {});

    const listReactions = postsLikeReaction.map((item) => {
      return {
        addedAt: item.createdAt,
        userId: item.userId || '',
        login: userIdToLoginMap[item.userId || ''],
      };
    });

    return PostViewDto.mapToView(post, listReactions, userStatus);
  }

  async getOneNoReactions(id: string): Promise<PostViewDto> {
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
    const listReactions = [];
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new CustomDomainException({
        errorsMessages: `Post by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    const status = LikeStatus.NONE;
    return PostViewDto.mapToView(post, listReactions, status);
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

    const postIdsFromCommentsCollection = await this.commentModel
      .find({ postId })
      .lean();
    const commentIds = postIdsFromCommentsCollection.map((item) =>
      item._id.toString(),
    );
    const allCommentsReactionWithUserIdAndCommentIds =
      await this.commentReactionModel
        .find({ userId, commentId: { $in: commentIds } })
        .lean();
    const reactionDictionary =
      allCommentsReactionWithUserIdAndCommentIds.reduce((acc, reaction) => {
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
      result.likesInfo.myStatus =
        reactionDictionary[_id.toString()] ?? LikeStatus.NONE;

      return {
        id: _id.toString(),
        ...result,
      };
    });

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
}
