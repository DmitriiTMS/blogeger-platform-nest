import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from './users-query.repository';
import { UserGetMeResponse, UserGetMeViewDto } from '../dto/viewsDto/getMe-view.dto';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  
  async getMe(userId: string): Promise<UserGetMeViewDto> {
    const user = await this.usersQueryRepository.getByIdOrNotFoundFail(userId)
    const userView = UserGetMeViewDto.mapToView(user);
    return userView
  }
}
