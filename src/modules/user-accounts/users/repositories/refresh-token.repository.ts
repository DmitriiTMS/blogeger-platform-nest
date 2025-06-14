import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokens } from '../schemas/refresh-token.schema';
import { Model } from 'mongoose';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokens.name)
    private refreshTokensModel: Model<RefreshTokens>,
  ) {}

  async addRefreshToken(refreshToken: { refreshToken: string }) {
    return await this.refreshTokensModel.insertOne(refreshToken);
  }

   async findByRefreshToken(refreshToken: string) {
    return await this.refreshTokensModel.findOne({ refreshToken });
  }

   async deleteRefreshToken(id: string) {
    return await this.refreshTokensModel.deleteOne({ _id: id });
  }
}
