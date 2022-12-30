import { Controller, Get, Res } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get()
  async auth() {
    return ['sdferawerewr'];
  }

  @Get('/signup')
  signup() {
    return ['sdfsadf'];
  }
}
