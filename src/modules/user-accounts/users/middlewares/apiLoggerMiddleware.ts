import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import { AccessToApi } from '../schemas/access-to-api.schema';
import { Model } from 'mongoose';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(AccessToApi.name) private accessToApiModel: Model<AccessToApi>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const originalUrl = req.originalUrl;

    const logEntry = {
    //   ip: userIp,
      url: originalUrl,
      date: new Date(),
    };

    await this.accessToApiModel.insertOne(logEntry);

    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const count = await this.accessToApiModel.countDocuments({
      // ip: logEntry.ip,
      url: logEntry.url,
      date: { $gte: tenSecondsAgo },
    });

    console.log('Count apiLoggerMiddleware = ', count);

    if (count > 5) {
      res.sendStatus(429);
      return;
    }

    next();
  }
}
