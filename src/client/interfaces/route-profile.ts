export type RouteProfileChartType = 'Wind' | 'Clouds' | 'Icing' | 'Turb';

export type RouteProfileWindDataType = 'Windspeed' | 'Head/tailwind';

export type RouteProfileIcingDataType = 'Prob' | 'Sev' | 'SLD';

export type RouteProfileTurbDataType = 'CAT' | 'MTW';

export type RouteProfileMaxAltitudes = 500 | 250 | 150;

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
