import {
  RouteProfileChartType,
  RouteProfileWindDataType,
  RouteProfileIcingDataType,
  RouteProfileTurbDataType,
  RouteProfileMaxAltitudes,
} from '../interfaces/route-profile';

export const hourInMili = 3600 * 1000;

export const totalNumberOfElevations = 200;

export const contourMin = -100;

export const contourMax = 60;

export const flightCategoryDivide = 5;

export const NODATA = -9999;

export const SUNSET_SUNRISE = {
  night: {
    start: 20,
    end: 4,
  },
  day: {
    start: 7,
    end: 17,
  },
};

export const NIGHT_GRADIENT_COLOR = 'rgb(24, 33, 48)';

export const DAY_GRADIENT_COLOR = 'rgb(109, 154, 229)';

export const cacheKeys = {
  airportProperties: 'airport-properties',
  gData: 'g-windspeed',
  icingTurb: 'icing-turb',
  nbmAllAirport: 'nbm-airport',
  nbm: 'nbm-all',
  elevation: 'elevation-api',
  departureAdvisor: 'departure-advisor',
  userSettings: 'update-usersettings',
};
export const routeProfileChartTypes: {
  wind: RouteProfileChartType;
  clouds: RouteProfileChartType;
  icing: RouteProfileChartType;
  turb: RouteProfileChartType;
} = {
  wind: 'Wind',
  clouds: 'Clouds',
  icing: 'Icing',
  turb: 'Turb',
};
export const routeProfileChartTypeLabels: {
  wind: string;
  clouds: string;
  icing: string;
  turb: string;
} = {
  wind: 'WIND',
  clouds: 'CLDS',
  icing: 'ICE',
  turb: 'TURB',
};

export const routeProfileWindDataTypes: {
  windspeed: RouteProfileWindDataType;
  headtail: RouteProfileWindDataType;
} = {
  windspeed: 'SPEED',
  headtail: 'HEAD/TAIL',
};

export const routeProfileIcingDataTypes: {
  prob: RouteProfileIcingDataType;
  sev: RouteProfileIcingDataType;
  sld: RouteProfileIcingDataType;
} = {
  prob: 'Prob',
  sev: 'Sev',
  sld: 'SLD',
};

export const routeProfileTurbDataTypes: {
  cat: RouteProfileTurbDataType;
  mtw: RouteProfileTurbDataType;
} = {
  cat: 'CAT',
  mtw: 'MWT',
};
const routeProfileMaxAltitudes: RouteProfileMaxAltitudes[] = [500, 300, 200];
export const chartLabels = {
  200: [200, 160, 120, 80, 40, 0],
  300: [300, 240, 180, 120, 60, 0],
  500: [500, 400, 300, 200, 100, 0],
};
export const windDataElevations = {
  500: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000],
  300: [3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000],
  200: [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000],
};

export const windQueryElevations = [
  2000, 3000, 4000, 5000, 6000, 8000, 9000, 10000, 12000, 14000, 15000, 16000, 18000, 20000, 21000, 24000, 25000, 27000,
  30000, 35000, 40000, 45000,
];
export const mobileLandscapeHeight = 680;

export const iPadPortraitWidth = 840;

export const temperatureContourColors = {
  positive: '#FBF209',
  negative: '#09FDC6',
};

export const hatchOpacity = 0.6;

export const visibleOpacity = 1;
export const probStrings = {
  1: 'Slight chance',
  2: 'Chance',
  3: 'Likely chance',
  4: 'Definite chance',
  5: 'Isolated',
  6: 'Scattered',
  7: 'Numerous',
};

export const wxStrings = {
  1: 'rain',
  2: 'freezing rain',
  3: 'snow',
  4: 'thunderstorms',
  5: 'rain showers',
  6: 'ice pellets',
  7: 'snow showers',
  8: 'fog',
};

export const intenStrings = {
  1: 'light',
  2: 'moderate',
  3: 'heavy',
};
