import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString,  MaxLength } from 'class-validator';
import { Trim } from '../../../../user-accounts/users/decorators/trim.decorator';


export const NameBlogApplyDecorator = () =>
  applyDecorators(Trim(), IsNotEmpty(), IsString(), MaxLength(15));
