import { Injectable } from '@nestjs/common';

import { UserGetMeResponse, UserGetMeViewDto } from '../../dto/viewsDto/getMe-view.dto';
import { UsersQueryRepository } from '../users/users-query.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  
  async getMe(userId: string): Promise<UserGetMeViewDto> {
    const user = await this.usersQueryRepository.getByIdOrNotFoundFail(userId)
    const userView = UserGetMeViewDto.mapToView(user);
    return userView
  }
}
