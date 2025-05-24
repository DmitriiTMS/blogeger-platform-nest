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
} from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { User } from '../schemas/users.schema';
import { UsersService } from '../services/users.service';
import { UsersQueryRepository } from '../repositories/users-query.repository';
import { UserViewDto } from '../dto/viewsDto/user-view.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: UserCreateDto): Promise<UserViewDto> {
    const user = await this.usersService.createUser(body);
    return UserViewDto.mapToView(user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<UserViewDto[]> {
    const usersDB = await this.usersQueryRepository.getAll();
    const items = usersDB.map((user) => UserViewDto.mapToView(user));
    return items;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
