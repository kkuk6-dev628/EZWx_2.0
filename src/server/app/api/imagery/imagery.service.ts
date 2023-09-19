import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class ImageryService {
  constructor(private readonly httpService: HttpService) {}
  async getTimeStamp(url: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data.map((d) => d[0]);
  }
}
