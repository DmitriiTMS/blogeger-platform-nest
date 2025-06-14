
import { NameBlogApplyDecorator } from './validateDto/nameBlog-validate-decorator';
import { DescriptionBlogApplyDecorator } from './validateDto/description-validate-decorator';
import { WebsiteUrlBlogApplyDecorator } from './validateDto/websiteUrl-validate-decorators';

export class CreateAndUpdateBlogtDto {
 @NameBlogApplyDecorator()
  name: string;

  @DescriptionBlogApplyDecorator()
  description: string;

  @WebsiteUrlBlogApplyDecorator(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string;
}
