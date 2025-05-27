import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { User } from '../schemas/users.schema';
import { UsersService } from '../services/users.service';
import { UsersQueryRepository } from '../repositories/users-query.repository';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';
import { GetUsersQueryParams } from '../dto/paginate/get-users-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAllUsers( @Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.getAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: UserCreateDto): Promise<UserViewDto> {
    const userId = await this.usersService.createUser(body);
    return await this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
