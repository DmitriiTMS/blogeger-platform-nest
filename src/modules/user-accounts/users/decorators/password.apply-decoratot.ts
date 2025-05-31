import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from './trim..decorator';

export const PasswordApplyDecorator = () =>
  applyDecorators(Trim(), IsNotEmpty(), IsString(), Length(3, 10));
