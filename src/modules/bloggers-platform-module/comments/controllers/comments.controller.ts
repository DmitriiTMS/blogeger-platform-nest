import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { CommentDocument } from '../schemas/comments.schema';
import { CommentViewDto } from '../dto/comment-view-dto';
import { JwtAuthGuard } from '../../../../modules/user-accounts/users/guards/jwt-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../../modules/user-accounts/users/decorators/extract-user-if-exists-from-request.decorator';
import { CommentDeleteDataDto } from '../dto/data-dto/comment-delete-data.dto';
import { CommentUpdateDto } from '../dto/comment-update.dto';
import { CommentUpdateDataDto } from '../dto/data-dto/comment-update-data.dto';
import { CommentReactionDto } from '../dto/reaction/comment-reaction.dto';
import { CommentIdReactionDto } from '../dto/reaction/commentId-reaction.dto';
import { CommentDataReactionDto } from '../dto/reaction/comment-data-reaction.dto';
import { AuthorizationCheckGuard } from '../../../user-accounts/users/guards/authorization-check.guard';
import { LikeStatus } from '../schemas/comment-reaction.schema';
import { CommentsQueryReactionsRepository } from '../dto/reaction/comment-query-reaction-repository.dto';


@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryReactionsRepository: CommentsQueryReactionsRepository
  ) {}

  @Get(':id')
  @UseGuards(AuthorizationCheckGuard)
  @HttpCode(HttpStatus.OK)
  async getOneComment(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: { userId: string }
  ): Promise<CommentViewDto> {
    const comment = await this.commentsService.getOne(id);
    let userStatus = LikeStatus.NONE; 

    if (user?.userId) {
      const reactionUser = await this.commentsQueryReactionsRepository.reactionForCommentIdAndUserId(id, user.userId);
      userStatus = reactionUser?.status || LikeStatus.NONE;
    }
    return this.mapToViewComment(comment, userStatus);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOneComment(
    @Body() body: CommentUpdateDto,
    @Param('commentId') commentId: string,
    @ExtractUserIfExistsFromRequest() user: { userId: string },
  ) {
    const dataUpdateComment: CommentUpdateDataDto = {
      content: body.content,
      commentId,
      userId: user.userId,
    };
    await this.commentsService.updateOne(dataUpdateComment);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneComment(
    @Param('commentId') commentId: string,
    @ExtractUserIfExistsFromRequest() user: { userId: string },
  ) {
    const dataDeleteComment: CommentDeleteDataDto = {
      commentId,
      userId: user.userId,
    };
    await this.commentsService.deleteOne(dataDeleteComment);
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addReactionByComment(
    @Body() body: CommentReactionDto,
    @Param() param: CommentIdReactionDto,
    @ExtractUserIfExistsFromRequest() user: { userId: string },
  ) {
    const data: CommentDataReactionDto = {
      status: body.likeStatus,
      commentId: param.commentId,
      userId: user.userId,
    };
    await this.commentsService.addReaction(data)
  }

  mapToViewComment(commentDB: CommentDocument, status: LikeStatus): CommentViewDto {
    return {
      id: commentDB._id.toString(),
      content: commentDB.content,
      commentatorInfo: {
        userId: commentDB.commentatorInfo.userId,
        userLogin: commentDB.commentatorInfo.userLogin,
      },
      createdAt: commentDB.createdAt,
      likesInfo: {
        likesCount: commentDB.likesInfo.likesCount,
        dislikesCount: commentDB.likesInfo.dislikesCount,
        myStatus: status,
      },
    };
  }
}
