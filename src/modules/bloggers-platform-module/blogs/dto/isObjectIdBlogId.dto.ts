import { IsMongoId } from "class-validator";
import {  Types } from "mongoose";

export class IsObjectBlogIdDto {
    @IsMongoId({message: "Не ObjectId"})
    blogId: string
}