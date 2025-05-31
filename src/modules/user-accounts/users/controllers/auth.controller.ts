import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserCreateDto } from '../dto/user-create.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: UserCreateDto) {
    return await this.authService.registerUser(body);
  }
}
