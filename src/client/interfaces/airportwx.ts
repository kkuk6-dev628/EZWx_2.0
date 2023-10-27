import {
  RouteProfileChartType,
  RouteProfileIcingDataType,
  RouteProfileMaxAltitudes,
  RouteProfileTurbDataType,
  RouteProfileWindDataType,
} from './route-profile';

export interface AirportWxState {
  id?: number;
  userId?: number;
  airport: string;
  chartDays: number;
  viewType: string;
  chartType: RouteProfileChartType;
  windLayer: RouteProfileWindDataType;
  icingLayers: RouteProfileIcingDataType[];
  turbLayers: RouteProfileTurbDataType[];
  maxAltitude: RouteProfileMaxAltitudes;
  showTemperature?: boolean;
}
