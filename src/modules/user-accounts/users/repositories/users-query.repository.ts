import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';
import { GetUsersQueryParams } from '../dto/paginate/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {};

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
