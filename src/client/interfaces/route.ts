export interface RoutePoint {
  key: string;
  name: string;
  type: string;
  position: GeoJSON.Point;
}

export interface RouteOfFlight {
  id?: number;
  routeId?: number;
  routePointId?: number;
  order?: number;
  routePoint: RoutePoint;
}

export interface Route {
  id?: number;
  departure: RoutePoint;
  routeOfFlight: RouteOfFlight[];
  destination: RoutePoint;
  altitude: number;
  useForecastWinds: boolean;
}

export type RouteProfileChartType = 'Wind' | 'Clouds' | 'Icing' | 'Turb';

export type RouteProfileWindDataType = 'Temp' | 'Wind' | 'Course';

export type RouteProfileIcingDataType = 'Prob' | 'Sev' | 'SLD' | 'Sev+SLD';

export type RouteProfileTurbDataType = 'CAT' | 'MTW' | 'Combined';
