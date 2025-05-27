import { LikeStatus } from '../../schemas/extendedLikesInfo.schema';
import { PostDocument } from '../../schemas/post.schema';

type NewestLikes = {
  addedAt: Date | string;
  userId: string;
  login: string;
};

type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikes[];
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoType;

  static mapToView(post: PostDocument, listReactions: NewestLikes[], status: LikeStatus): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus: status,
      newestLikes: listReactions,
    };

    return dto;
  }
}
