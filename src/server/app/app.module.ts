import { gisdbConfig } from './../../../ormconfig';
import { ApiModule } from './api/api.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from 'ormconfig';
import { CertificationModule } from './certification/certification.module';
import { SettingsModule } from './settings/settings.module';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../../src/client/public'),
      exclude: ['/api/(.*)'],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forRoot(gisdbConfig),
    ApiModule,
    ConsoleModule,
    AuthModule,
    UserModule,
    CertificationModule,
    SettingsModule,
    MailModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
