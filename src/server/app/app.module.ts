import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from 'ormconfig';
import { CertificationModule } from './certification/certification.module';
import { SettingsModule } from './settings/settings.module';
import { DefaultSettingsModule } from './default_settings/default_settings.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ConsoleModule,
    AuthModule,
    UserModule,
    CertificationModule,
    SettingsModule,
    DefaultSettingsModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
