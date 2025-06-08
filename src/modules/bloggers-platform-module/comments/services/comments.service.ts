import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repositories/comments.repository';
import { CommentDocument } from '../schemas/comments.schema';
import { CommentDeleteDataDto } from '../dto/data-dto/comment-delete-data.dto';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { CommentUpdateDataDto } from '../dto/data-dto/comment-update-data.dto';
import { IsExistUserComment } from '../dto/data-dto/comment-is-exist-user-data.dto';
import mongoose from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}

  async getOne(id: string): Promise<CommentDocument> {
    const comment = await this.commentsRepository.getOneCommentById(id);
    return comment;
  }

  async updateOne(updateCommentDto: CommentUpdateDataDto) {
    const { content, commentId } = updateCommentDto;
     if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `CommentId not ObjectId Mongoose`,
            field: 'commentId',
          },
        ],
      });
    }
    const comment = await this.commentsRepository.findCommentByIdOrFail(commentId);
    const isExistUserComment = await this.isExistUserComment(updateCommentDto);
    if (!isExistUserComment) {
      throw new CustomDomainException({
        errorsMessages: 'Пользователь пытается обновить не свой комментарий',
        customCode: DomainExceptionCode.Forbidden,
      });
    }
    comment.updateForContent(content);
    await this.commentsRepository.save(comment);
  }

  async deleteOne(deleteCommentDto: CommentDeleteDataDto) {
    const { commentId } = deleteCommentDto;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `CommentId not ObjectId Mongoose`,
            field: 'commentId',
          },
        ],
      });
    }
    const isExistUserComment = await this.isExistUserComment(deleteCommentDto);
    if (!isExistUserComment) {
      throw new CustomDomainException({
        errorsMessages: 'Пользователь пытается удалить не свой комментарий',
        customCode: DomainExceptionCode.Forbidden,
      });
    }
    await this.commentsRepository.deleteCommentById(commentId);
  }

  async isExistUserComment(commentDto: IsExistUserComment): Promise<boolean> {
    const { commentId, userId } = commentDto;
    const comment =
      await this.commentsRepository.findCommentByIdOrFail(commentId);
    if (comment.commentatorInfo.userId !== userId) {
      return false;
    }
    return true;
  }
}
