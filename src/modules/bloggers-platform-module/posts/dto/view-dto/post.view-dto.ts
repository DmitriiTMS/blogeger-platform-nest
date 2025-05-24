import { LikeStatus } from '../../schemas/extendedLikesInfo.schema';
import { PostDocument } from '../../schemas/post.schema';

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;

  newestLikes: [
    {
      addedAt: string;
      userId: string;
      login: string;
    },
  ];

  static mapToView(post: PostDocument): PostViewDto {
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
      myStatus: post.extendedLikesInfo.myStatus,
    };


    dto.newestLikes = [
      {
        addedAt: '2025-05-24T10:30:07.491Z',
        userId: 'userId',
        login: 'login',
      },
    ];

    return dto;
  }
}
