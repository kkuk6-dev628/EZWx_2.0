export interface RoutePoint {
  key: string;
  name: string;
  type: string;
  position: GeoJSON.Point;
}

export interface Route {
  departure: RoutePoint;
  routeOfFlight: RoutePoint[];
  destination: RoutePoint;
  altitude: number;
  useForecastWinds: boolean;
}
