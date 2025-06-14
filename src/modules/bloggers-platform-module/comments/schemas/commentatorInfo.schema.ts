import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';


@Schema({ _id: false }) 
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  static createInstance(dto:{ userId: string; userLogin: string }) {
     const commentatorInfo = new this();
     commentatorInfo.userId = dto.userId
     commentatorInfo.userLogin = dto.userLogin
     return commentatorInfo
  }
}

export const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);



