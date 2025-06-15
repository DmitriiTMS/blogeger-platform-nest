import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Devices } from '../../schemas/devices.schema';
import { Model } from 'mongoose';

type SeesionDevice = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: string;
  refreshToken: string;
};

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Devices.name)
    private devicesModel: Model<Devices>,
  ) {}
  async createSession(session: SeesionDevice) {
    return await this.devicesModel.insertOne(session);
  }
}
