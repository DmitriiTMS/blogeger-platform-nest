import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostCreateDto } from '../dto/post-create.dto';
import { PostsService } from '../services/posts.service';
import { PostViewDto } from '../dto/view-dto/post.view-dto';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { PostUpdateDto } from '../dto/post-update.dto';
import { GetPostsQueryParams } from '../paginate/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';
import { PostCommentCreateDto } from '../dto/post-comment-create.dto';
import { JwtAuthGuard } from '../../../user-accounts/users/guards/jwt-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/users/decorators/extract-user-if-exists-from-request.decorator';
import { PostDataCommentCreateDto } from '../dto/post-data-comment-create.dto';
import { CommentDocument } from '../../comments/schemas/comments.schema';
import { CommentViewDto } from '../../comments/dto/comment-view-dto';
import { BasicAuthGuard } from '../../../../modules/user-accounts/users/guards/basic-auth.guard';
import { AuthorizationCheckGuard } from '../../../../modules/user-accounts/users/guards/authorization-check.guard';
import { LikeStatus } from '../schemas/extendedLikesInfo.schema';
import { PostReactionBodyDto } from '../dto/reaction/post-reaction-body.dto';
import { PostReactionParamDto } from '../dto/reaction/post-reaction-param.dto';
import { PostDataReactionDto } from '../dto/reaction/post-reaction-data.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  // @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.postsQueryRepository.getAllPost(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOnePost(@Param('id') id: string): Promise<PostViewDto | null> {
    return await this.postsQueryRepository.getOneWithReactions(id);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() body: PostCreateDto): Promise<PostViewDto> {
    const postId = await this.postsService.createPost(body);
    return await this.postsQueryRepository.getOneWithReactions(postId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOnePost(@Param('id') id: string, @Body() body: PostUpdateDto) {
    return await this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneBlog(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addReactionPost(
    @Body() body: PostReactionBodyDto,
    @Param() param: PostReactionParamDto,
    @ExtractUserIfExistsFromRequest() user: { userId: string },
  ) {
    const data: PostDataReactionDto = {
      status: body.likeStatus,
      postId: param.postId,
      userId: user.userId
    }

    console.log(data);
    
    
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentsByPostId(
    @Body() body: PostCommentCreateDto,
    @Param('postId') postId: string,
    @ExtractUserIfExistsFromRequest() user: { userId: string },
  ): Promise<CommentViewDto> {
    const data: PostDataCommentCreateDto = {
      content: body.content,
      postId,
      userId: user.userId,
    };
    const newComment = await this.postsService.createCommentsByPostId(data);
    return this.mapCommentDBToCommentView(newComment)
  }

  @Get(':postId/comments')
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getAllCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: { userId: string }
  ) {

    return await this.postsQueryRepository.getAllCommentsByPostId(
      postId,
      query,
      user?.userId
    );
  }

   mapCommentDBToCommentView(
    comment: CommentDocument
  ): CommentViewDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: comment.likesInfo.myStatus,
      },
    };
  }
}
