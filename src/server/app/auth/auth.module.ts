import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ViewModule } from 'src/server/view/view.module';

@Module({
  controllers: [AuthController],
  imports: [UserModule, PassportModule, JwtAuthModule],
  providers: [AuthService],
})
export class AuthModule {}
