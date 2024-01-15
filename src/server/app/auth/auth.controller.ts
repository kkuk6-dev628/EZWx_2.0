import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto, AuthSinginDto } from './dto';
import { ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { UserService } from '../user/user.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Post('signup')
  async signup(@Body(new ValidationPipe()) dto: AuthSignupDto, @Res() res: Response) {
    const { access_token, id, email, displayName } = await this.authService.signup(dto);
    return (
      res
        .cookie('access_token', access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
        .cookie('logged_in', true)
        // .status(HttpStatus.OK)
        .json({ message: 'Signup successfully', id, email, displayName })
    );
  }

  @Post('signin')
  async signin(@Body(new ValidationPipe()) dto: AuthSinginDto, @Res() res: Response) {
    const { access_token, id, email, displayName } = await this.authService.signin(dto);
    return (
      res
        .cookie('access_token', access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
        .cookie('logged_in', true)
        // .status(HttpStatus.OK)
        .json({
          message: 'Logged in successfully',
          id,
          email,
          displayName,
        })
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUser')
  async getUser(@Request() request) {
    return this.authService.getUser(request.user.id);
  }

  @Get('reset-password-start')
  async resetPasswordStart(@Request() request) {
    return this.authService.resetPasswordStart(request.get('Host'), request.query.email);
  }

  @Get('validate-token/:token')
  async validateToken(@Param('token') token) {
    console.log(token);
    return this.userService.validateToken(token);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: AuthSinginDto) {
    return this.authService.updatePassword(dto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signout(@Res() res: Response) {
    res.clearCookie('access_token', { httpOnly: true });
    res.clearCookie('logged_in');
    return res.json({ message: 'Signout Successful' });
  }
}
