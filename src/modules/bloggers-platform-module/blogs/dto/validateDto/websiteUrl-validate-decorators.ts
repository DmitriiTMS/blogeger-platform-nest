import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString,  Matches,  MaxLength } from 'class-validator';
import { Trim } from '../../../../user-accounts/users/decorators/trim.decorator';


export const WebsiteUrlBlogApplyDecorator = (regex: RegExp) =>
  applyDecorators(Trim(), IsNotEmpty(), Matches(regex), MaxLength(100));

