import { IsMongoId } from "class-validator";

export class PostCreateDto {
  title: string;
  shortDescription: string;
  content: string;
  @IsMongoId({message: "Не ObjectId"})
  blogId: string
}
