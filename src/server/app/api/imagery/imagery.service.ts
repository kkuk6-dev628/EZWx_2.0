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

  async getImageryState(user: User) {
    const res = await this.imageryRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    return res;
  }

  async updateImageryState(imageryState) {
    return (await this.imageryRepository.upsert(imageryState, ['userId'])).generatedMaps[0].id;
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
