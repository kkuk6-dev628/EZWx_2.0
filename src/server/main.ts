import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as compression from 'compression';

import { ServerModule } from 'src/server/server.module';

async function bootstrap() {
  const httpsOptions = {
    key: process.env.PKEY_PATH ? fs.readFileSync(process.env.PKEY_PATH) : undefined,
    cert: process.env.CERT_PATH ? fs.readFileSync(process.env.CERT_PATH) : undefined,
  };
  const app = httpsOptions.key
    ? await NestFactory.create(ServerModule, {
        httpsOptions,
      })
    : await NestFactory.create(ServerModule);
  app.use(cookieParser());
  app.use(compression());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
