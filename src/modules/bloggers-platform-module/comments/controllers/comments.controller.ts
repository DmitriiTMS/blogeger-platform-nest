import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommentsService } from '../services/comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneComment(@Param('id') id: string) {
    return await this.commentsService.getOne(id);
  }
}
