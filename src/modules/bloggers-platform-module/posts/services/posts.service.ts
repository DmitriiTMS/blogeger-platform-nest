import { Injectable, NotFoundException } from '@nestjs/common';
import { PostCreateDto } from '../dto/post-create.dto';
import { Post, PostModelType } from '../schemas/post.schema';
import { PostsRepository } from '../repositories/posts.repository';
import { PostUpdateDto } from '../dto/post-update.dto';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { PostDataCommentCreateDto } from '../dto/post-data-comment-create.dto';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import mongoose, { Types } from 'mongoose';
import { UsersRepository } from '../../../../modules/user-accounts/users/repositories/users/users.repository';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../comments/schemas/comments.schema';
import { PostDataReactionDto } from '../dto/reaction/post-reaction-data.dto';
import { LikeStatus } from '../schemas/post-reaction.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private commentRepository: CommentsRepository,
  ) {}

  async createPost(createPostDto: PostCreateDto) {
    const blog = await this.blogsRepository.getOne(createPostDto.blogId);
    if (!blog) {
      throw new NotFoundException(`Blog by ${createPostDto.blogId} not found`);
    }

    const post = this.PostModel.createInstance(
      {
        title: createPostDto.title,
        shortDescription: createPostDto.shortDescription,
        content: createPostDto.content,
        blogId: createPostDto.blogId,
      },
      blog.name,
    );
    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async updatePost(id: string, postDto: PostUpdateDto) {
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
    const post = await this.postsRepository.findPost(id);
    if (!post) {
      throw new NotFoundException(`Post by ${id} not found`);
    }
    return await this.postsRepository.update(id, postDto);
  }

  async deletePost(id: string) {
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
    return await this.postsRepository.delete(id);
  }

  async createCommentsByPostId(
    dataForCreteCommentDto: PostDataCommentCreateDto,
  ): Promise<CommentDocument> {
    const { content, postId, userId } = dataForCreteCommentDto;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `PostId not ObjectId Mongoose`,
            field: 'postId',
          },
        ],
      });
    }

    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new CustomDomainException({
        errorsMessages: `Post by ${postId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const user = await this.usersRepository.getOne(userId);
    if (!user) {
      throw new CustomDomainException({
        errorsMessages: `User by ${userId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const newComment = this.CommentModel.createInstance(
      {
        content,
        postId,
        userId,
      },
      user.login,
    );

    await this.commentRepository.save(newComment);
    return newComment;
  }

  async addReaction(postDataReactionDto: PostDataReactionDto) {
    const {status, userId, postId} = postDataReactionDto;

    const post = await this.postsRepository.findPost(postId)
    if(!post) {
      throw new CustomDomainException({
        errorsMessages: `Posts by id = ${postId} not found`,
        customCode: DomainExceptionCode.NotFound
      });
    }

    const user = await this.usersRepository.getOne(userId);
    if(!user) {
      throw new CustomDomainException({
        errorsMessages: `User by id = ${userId} not found`,
        customCode: DomainExceptionCode.NotFound
      });
    }

    const isReactionForPostIdAndUserId = await this.postsRepository.reactionForPostIdAndUserId(postId, userId);
     if(!isReactionForPostIdAndUserId) {
      await this.postsRepository.saveInPostReaction(postDataReactionDto)

      const [totalCountLike, totalCountDislike] = await Promise.all([
        this.postsRepository.postsLikeCount(postId, LikeStatus.LIKE),
        this.postsRepository.postsDislikeCount(postId, LikeStatus.DISLIKE),
      ]);

      await Promise.all([
        this.postsRepository.likeCountUpdate(postId, totalCountLike),
        this.postsRepository.dislikeCountUpdate(postId, totalCountDislike),
      ]);

      return
    }

     if(status !== isReactionForPostIdAndUserId.status) {
      await this.postsRepository.updatePostReaction(isReactionForPostIdAndUserId._id.toString(), status);
        const [totalCountLike, totalCountDislike] = await Promise.all([
        this.postsRepository.postsLikeCount(postId, LikeStatus.LIKE),
        this.postsRepository.postsDislikeCount(postId, LikeStatus.DISLIKE),
      ]);

      await Promise.all([
        this.postsRepository.likeCountUpdate(postId, totalCountLike),
        this.postsRepository.dislikeCountUpdate(postId, totalCountDislike),
      ]);

      return
    }


   
  }
}
