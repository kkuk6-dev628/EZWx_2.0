import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { parse } from 'url';
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

  // @UseGuards(JwtAuthGuard)
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
