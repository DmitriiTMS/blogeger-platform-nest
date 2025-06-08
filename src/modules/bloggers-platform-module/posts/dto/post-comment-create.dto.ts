import { IsNotEmpty, IsString, Length } from "class-validator";

export class PostCommentCreateDto {
    @IsNotEmpty({message: 'Content не может быть пустым'})
    @IsString({message: 'Content должен быть строкой'})
    @Length(20,300, {message: 'Content должен быть минимум 20 символов и максимум 300 символов'})
    content: string
}