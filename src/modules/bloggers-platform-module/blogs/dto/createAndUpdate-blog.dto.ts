import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateAndUpdateBlogtDto {
  @IsNotEmpty({ message: 'Поле name не может быть пустым' })
  @IsString({ message: 'Поле name должно быть строкой' })
  @MaxLength(15, { message: 'Максимальное количество символов 15' })
  name: string;

  @IsNotEmpty({ message: 'Поле description не может быть пустым' })
  @IsString({ message: 'Поле description должно быть строкой' })
  @MaxLength(500, { message: 'Максимальное количество символов 500' })
  description: string;

  @IsNotEmpty({ message: 'Поле websiteUrl не может быть пустым' })
  @MaxLength(100, { message: 'Максимальное количество символов 100' })
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    {
      message: 'websiteUrl должен начинаться с https:// и соответствовать формату: https://site.exemples.com',
    },
  )
  websiteUrl: string;
}
