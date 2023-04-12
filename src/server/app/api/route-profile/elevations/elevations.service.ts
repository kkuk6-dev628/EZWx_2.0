import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

const opentopodataUrl = 'https://api.opentopodata.org/v1/aster30m';
@Injectable()
export class ElevationsService {
  constructor(private readonly httpService: HttpService) {}

  async executeGet(points: GeoJSON.Position[]): Promise<any> {
    const url = opentopodataUrl + '?locations=' + points.map((position) => position[1] + ',' + position[0]).join('|');
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
