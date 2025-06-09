import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SETTINGS } from '../../../../core/settings';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthorizationCheckGuard implements CanActivate {
  constructor(
    @Inject(SETTINGS.ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessJwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Если токена нет, пропускаем (например, для публичных эндпоинтов)
    if (!authHeader) {
      return true;
    }

    const [authType, token] = authHeader.split(' ');

    if (authType !== 'Bearer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const payload = this.accessJwtService.verify(token, {
      secret: SETTINGS.ACCESS_TOKEN_SECRET,
    });

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Добавляем информацию о пользователе в request
    request.user = {
      userId: payload.userId,
      userLogin: payload.userLogin,
    };

    return true;
  }
}
