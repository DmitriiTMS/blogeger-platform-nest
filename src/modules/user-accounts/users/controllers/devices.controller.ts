import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";

@Controller('security')
export class AuthController {

    @Get('devices')
    @HttpCode(HttpStatus.OK)
    async getAllDevices() {
        console.log('getAllDevices');
    }
}