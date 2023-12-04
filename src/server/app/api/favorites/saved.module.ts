import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedItem, SavedOrder } from './saved.entity';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem, SavedOrder])],
  controllers: [SavedController],
  providers: [SavedService],
})
export class SavedModule {}
