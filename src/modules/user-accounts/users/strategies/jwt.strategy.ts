import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable} from '@nestjs/common';
import { SETTINGS } from '../../../../core/settings';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SETTINGS.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId };
  }
}