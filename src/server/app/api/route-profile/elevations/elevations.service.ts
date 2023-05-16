import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

const opentopodataUrl = 'https://api.opentopodata.org/v1/aster30m';
const openMeteoUrl = 'https://api.open-meteo.com/v1/elevation';
const elevationApiUrl = 'https://api.elevationapi.com/api/Elevation/points';

@Injectable()
export class ElevationsService {
  constructor(private readonly httpService: HttpService) {}

  async queryOpenTopo(points: GeoJSON.Position[]): Promise<any> {
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

  async queryOpenMeteo(points: GeoJSON.Position[]): Promise<any> {
    const url =
      openMeteoUrl +
      '?latitude=' +
      points.map((position) => position[1]).join(',') +
      '&longitude=' +
      points.map((position) => position[0]).join(',');
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

  async queryElevationApi(points: GeoJSON.Position[]): Promise<any> {
    // const lineStrings = [];
    // points.reduce((prev, cur) => {
    //   lineStrings.push({ type: 'LineString', coordinates: [prev, cur] });
    //   return cur;
    // });
    // const results = [];
    // for (const line of lineStrings) {
    //   const { data } = await firstValueFrom(
    //     this.httpService.post(elevationApiUrl, { line, dataSetName: 'SRTM_GL3', reduceResolution: 20 }).pipe(
    //       catchError((error: AxiosError) => {
    //         console.error(error.response.data);
    //         throw 'An error happened!';
    //       }),
    //     ),
    //   );
    //   results.push(...data.geoPoints);
    //   console.log(data);
    // }
    // return results;
    const { data } = await firstValueFrom(
      this.httpService
        .post(elevationApiUrl, {
          points: { type: 1, coordinates: points },
          dataSetName: 'NASADEM',
          reduceResolution: 20,
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return { results: data.geoPoints };
  }
}
