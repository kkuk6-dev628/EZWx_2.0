import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import createServer from 'next';
import { NextServer } from 'next/dist/server/next';

@Injectable()
export class ViewService implements OnModuleInit {
  private server: NextServer;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      console.log('node env config from .env', this.configService.get<string>('NODE_ENV'));
      console.log('node env from process', process.env.NODE_ENV);
      this.server = createServer({
        dev: this.configService.get<string>('NODE_ENV') !== 'production',
        dir: './src/client',
      });
      await this.server.prepare();
      console.log('nextjs server created with following options.', this.server.options);
    } catch (error) {
      console.error(error);
    }
  }

  getNextServer(): NextServer {
    return this.server;
  }
}
