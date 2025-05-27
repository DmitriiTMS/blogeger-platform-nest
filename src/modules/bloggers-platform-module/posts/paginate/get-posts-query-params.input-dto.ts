import { BaseQueryParams } from 'src/core/paginate/base.query-params.dto';

export enum PostsSortBy {
  CreatedAt = 'createdAt',
}

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}
