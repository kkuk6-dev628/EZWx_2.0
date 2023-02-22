import { gisdbConfig } from './../../../ormconfig';
import { ApiModule } from './api/api.module';
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
import { StationTime } from './api/station-time/station-time.gisdb-entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forRoot(gisdbConfig),
    ApiModule,
    ConsoleModule,
    AuthModule,
    UserModule,
    CertificationModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
