import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  async getOneCommentById(id: string) {
    await this.findCommentById(id);
    return {
      id: 'string',
      content: 'string',
      commentatorInfo: {
        userId: 'string',
        userLogin: 'string',
      },
      createdAt: '2025-05-25T14:40:33.940Z',
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async findCommentById(id: string) {
    const comments = ['1', '2', '3'];
    const findComment = comments.some((item) => item === id);
    if (!findComment) {
      throw new NotFoundException(`Comments ${id} not found`);
    }
  }
}
