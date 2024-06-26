import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { parse } from 'url';
import * as fs from 'fs';
import { JwtAuthGuard } from '../app/auth/jwt/jwt-auth.guard';

import { ViewService } from './view.service';

@Controller('/')
export class ViewController {
  constructor(private viewService: ViewService) {}

  async handler(req: Request, res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname, parsedUrl.query);
  }

  @Get('offline.html')
  public async getOfflineHtml(@Req() req: Request, @Res() res: Response) {
    res.send('You are offline!');
  }

  @Get('')
  public async showIndex(@Req() req: Request, @Res() res: Response) {
    await this.viewService.getNextServer().render(req, res, '/home');
  }

  @Get('index.html')
  public async showIndexHtml(@Req() req: Request, @Res() res: Response) {
    await this.viewService.getNextServer().render(req, res, '/home');
  }

  @Get('home')
  public async showHome(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    const serverSideProps = { dataFromController: '123' };

    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, Object.assign(parsedUrl.query, serverSideProps));
  }

  @Get('pricing')
  public async showPricing(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname);
  }

  @Get('signin')
  public async showSignin(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname);
  }

  @Get('signup')
  public async showSignup(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname);
  }

  @UseGuards(JwtAuthGuard)
  @Get('map')
  public async tryEZWxBrief(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    const serverSideProps = { dataFromController: '123' };

    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, Object.assign(parsedUrl.query, serverSideProps));
  }

  @UseGuards(JwtAuthGuard)
  @Get('imagery')
  public async imagery(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname, Object.assign(parsedUrl.query));
  }

  @Get('training')
  public async showTraining(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  public async showProfile(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('route-profile')
  public async RouteProfile(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('airportwx')
  public async AirportWx(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  public async Dashboard(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }
  @UseGuards(JwtAuthGuard)
  @Get('pilots-guide')
  public async PilotsGuide(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('instant-answers')
  public async InstantAnswers(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('amazing-imagery')
  public async AmazingImagery(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('stunning-visualizations')
  public async StunningVisualizations(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('pricing')
  public async Pricing(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('contact-us')
  public async ContactUs(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('support')
  public async Support(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('team-ezwxbrief')
  public async Team(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('faq')
  public async Faq(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('reset-password')
  public async ResetPassword(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }
  @Get('auth/reset')
  public async ResetPasswordPage(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('account/eula')
  public async Eula(@Req() req: Request, @Res() res: Response) {
    req.url = '/eula';
    await this.handler(req, res);
  }

  @Get('_next*')
  public async assets(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService.getNextServer().render(req, res, parsedUrl.pathname, parsedUrl.query);
  }
}
