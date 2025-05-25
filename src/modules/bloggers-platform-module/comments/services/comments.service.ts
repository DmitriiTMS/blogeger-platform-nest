import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repositories/comments.repository';

@Injectable()
export class CommentsService {

  constructor(
    private commentsRepository:CommentsRepository
  ){}

  async getOne(id: string) {
    const comment = await this.commentsRepository.getOneCommentById(id);
    return comment
  }
}
