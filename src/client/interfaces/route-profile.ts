import { RoutePoint } from './route';

export type RouteProfileChartType = 'Wind' | 'Clouds' | 'Icing' | 'Turb';

export type RouteProfileWindDataType = 'SPEED' | 'HEAD/TAIL';

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
  showTemperature?: boolean;
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
  dataset: {
    allowMissingDataGeneration: boolean;
    attribution: any;
    dataSource: any;
    description: string;
    extentInfo: string;
    fileFormat: any;
    isListed: boolean;
    name: string;
    noDataValue: number;
    pointsPerDegree: number;
    publicUrl: string;
    resolutionArcSeconds: number;
    resolutionMeters: number;
    srid: number;
  };
  geoPoints: {
    elevation: number;
    latitude: number;
    longitude: number;
  }[];
  message: string;
  resultCount: number;
  statusCode: number;
}

export interface AirportNbmData {
  faaid: string;
  icaoid: string;
  temp_c: number;
  dewp_c: number;
  skycov: number;
  w_speed: number;
  w_dir: number;
  w_gust: number;
  vis: number;
  ceil: number;
  l_cloud: number;
  cross_r_id: string;
  cross_com: number;
  wx_1: number;
  wx_2: number;
  wx_3: number;
  wx_prob_cov_1: number;
  wx_prob_cov_2: number;
  wx_prob_cov_3: number;
  wx_inten_1: number;
  wx_inten_2: number;
  wx_inten_3: number;
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
    offset: number;
  };
  course: number;
  airport?: RoutePoint;
  segmentNbmProps: NbmProperties;
  airportNbmProps?: NbmProperties;
  isRoutePoint: boolean;
}
