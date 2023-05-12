import { RoutePoint } from './route';

export type RouteProfileChartType = 'Wind' | 'Clouds' | 'Icing' | 'Turb';

export type RouteProfileWindDataType = 'Windspeed' | 'Head/tailwind';

export type RouteProfileIcingDataType = 'Prob' | 'Sev' | 'SLD';

export type RouteProfileTurbDataType = 'CAT' | 'MWT';

export type RouteProfileMaxAltitudes = 500 | 300 | 200;

export interface RouteProfileState {
  id?: number;
  userId?: number;
  chartType: RouteProfileChartType;
  windLayer: RouteProfileWindDataType;
  icingLayers: RouteProfileIcingDataType[];
  turbLayers: RouteProfileTurbDataType[];
  maxAltitude: RouteProfileMaxAltitudes;
}

export interface OpenTopoApiResult {
  results: {
    dataset: string;
    elevation: number;
    location: {
      lat: number;
      lng: number;
    };
  }[];
}

export interface OpenMeteoApiResult {
  elevation: number[];
}

export interface ElevationApiResult {
  results: {
    elevation: number;
    latitude: number;
    longitude: number;
  }[];
}

export interface RouteProfileDataset {
  time: string[];
  elevations: number[];
  data: {
    position: GeoJSON.Position;
    data: {
      elevation: number;
      value: number;
      time: string;
    }[];
  }[];
}

export interface NbmProperties {
  cloudbase: number;
  cloudceiling: number;
  dewpoint: number;
  gust: number;
  skycover: number;
  temperature: number;
  visibility: number;
  winddir: number;
  windspeed: number;
  wx_1: number;
  time: number;
}

export interface RouteSegment {
  position: { lat: number; lng: number };
  accDistance: number;
  arriveTime: number;
  departureTime: {
    full: string;
    date: string;
    time: string;
    hour: number;
    minute: number;
  };
  course: number;
  airport?: RoutePoint;
  segmentNbmProps: NbmProperties;
  airportNbmProps?: NbmProperties;
  isRoutePoint: boolean;
}
