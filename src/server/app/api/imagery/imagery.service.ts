import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Imagery } from './imagery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
@Injectable()
export class ImageryService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Imagery)
    private imageryRepository: Repository<Imagery>,
  ) {}

  async getRecentImageries(user: User) {
    return await this.imageryRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        updated_at: 'DESC',
      },
    });
  }

  async addRecentImagery(imagery, user: User) {
    const existing = await this.imageryRepository.findOne({
      where: {
        selectedImageryId: imagery.selectedImageryId,
        userId: user.id,
      },
    });
    if (existing) {
      existing.updated_at = new Date();
      return (await this.imageryRepository.save(existing)).id;
    } else {
      imagery.userId = user.id;
      const id = (await this.imageryRepository.insert(imagery)).generatedMaps[0].id;
      const oldRows = await this.imageryRepository.find({
        select: ['id'],
        where: {
          userId: user.id,
        },
        order: {
          created_at: 'DESC',
        },
        skip: 10,
      });
      if (oldRows.length > 0) {
        this.imageryRepository.delete(oldRows.map((x) => x.id));
      }
      return id;
    }
  }

  async deleteRecentImagery(imageryId, user: User) {
    const result = await this.imageryRepository.delete(imageryId);
    return result.affected;
  }

  async getTimeStamp(url: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }
}
