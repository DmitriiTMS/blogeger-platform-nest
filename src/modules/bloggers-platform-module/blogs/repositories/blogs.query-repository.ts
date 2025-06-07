import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../schemas/blog.schema';
import { FilterQuery, Model } from 'mongoose';
import { BlogViewDto } from '../dto/views-dto/blog.view-dto';
import { GetBlogsQueryParams } from '../paginate/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/paginate/base.paginate.view-dto';


@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
    });
    if (!blog) {
      throw new NotFoundException(`Blog by ${id} not found`);
    }
    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter: FilterQuery<Blog> = {};

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map(BlogViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getOne(id: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(id);
  }
}
