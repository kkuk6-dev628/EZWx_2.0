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
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }

  @Get('pwa-serviceworker.js')
  public async getServiceWorkerJS1(@Req() req: Request, @Res() res: Response) {
    const buffer = fs.readFileSync('./src/public/pwa-serviceworker.js');
    res.type('text/javascript').send(buffer);
  }
  @Get('favicon.ico')
  public async getFavicon(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }
  @Get('offline.html')
  public async getOfflineHtml(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    res.send('You are offline!');
  }

  @Get('home')
  public async showHome(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    const serverSideProps = { dataFromController: '123' };

    await this.viewService
      .getNextServer()
      .render(
        req,
        res,
        parsedUrl.pathname,
        Object.assign(parsedUrl.query, serverSideProps),
      );
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

  @Get('try-ezwxbrief')
  public async tryEZWxBrief(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    const serverSideProps = { dataFromController: '123' };

    await this.viewService
      .getNextServer()
      .render(
        req,
        res,
        parsedUrl.pathname,
        Object.assign(parsedUrl.query, serverSideProps),
      );
  }

  @Get('imagery')
  public async imagery(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, Object.assign(parsedUrl.query));
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
  @Get('orders')
  public async indexOrders(@Req() req: Request, @Res() res: Response) {
    await this.handler(req, res);
  }

  @Get('_next*')
  public async assets(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }
}
