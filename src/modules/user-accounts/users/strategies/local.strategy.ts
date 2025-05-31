import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, loginOrEmail: string, password: string): Promise<any> {    
    const user = await this.authService.validateUser(loginOrEmail, password);
    if(!user) {
      throw new UnauthorizedException()
    }
    return user;
  }
}