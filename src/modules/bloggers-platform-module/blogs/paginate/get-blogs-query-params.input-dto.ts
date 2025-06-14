import { BaseQueryParams } from '../../../../core/paginate/base.query-params.dto';

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
}

export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
