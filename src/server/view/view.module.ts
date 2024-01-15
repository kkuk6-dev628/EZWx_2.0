import { Global, Module } from '@nestjs/common';

import { ViewController } from './view.controller';
import { ViewService } from './view.service';

@Global()
@Module({
  imports: [],
  providers: [ViewService],
  exports: [ViewService],
  controllers: [ViewController],
})
export class ViewModule {}
