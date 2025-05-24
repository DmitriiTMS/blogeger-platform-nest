import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  async getOne(id: string) {
    return {
      id,
      content: 'content',
      commentatorInfo: {
        userId: 'userId',
        userLogin: 'userLogin',
      },
      createdAt: '2025-05-24T09:55:41.545Z',
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
}
