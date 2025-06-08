import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../schemas/comments.schema';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
  ) {}

  async save(comment: CommentDocument) {
    await comment.save();
  }

  async getOneCommentById(id: string): Promise<CommentDocument> {
    const comment = await this.findCommentByIdOrFail(id);
    return comment
  }

   async deleteCommentById(id: string) {
    await this.commentModel.deleteOne(new Types.ObjectId(id))
  }

  async findCommentByIdOrFail(id: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new CustomDomainException({
        errorsMessages: `Comments by id = ${id} not found`,
        customCode: DomainExceptionCode.NotFound
      });
    }
    return comment
  }
 
}
