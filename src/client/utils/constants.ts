import { Route } from '../interfaces/route';
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

export const ICON_INDENT = 22;

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
export const humidityThresholds = {
  1000: 98,
  2000: 98,
  3000: 97,
  4000: 95,
  5000: 94,
  6000: 93,
  7000: 92,
  8000: 90,
  9000: 88,
  10000: 86,
  11000: 85,
  12000: 85,
  13000: 85,
  14000: 85,
  15000: 86,
  16000: 90,
  17000: 92,
  18000: 95,
  19000: 95,
  20000: 95,
  21000: 95,
  22000: 96,
  23000: 97,
  24000: 98,
  25000: 98,
  26000: 98,
  27000: 98,
  28000: 98,
  29000: 98,
  30000: 98,
  31000: 98,
  32000: 98,
  33000: 98,
  34000: 98,
  35000: 98,
  36000: 98,
  37000: 98,
  38000: 98,
  39000: 98,
  40000: 98,
  41000: 98,
  42000: 98,
  43000: 98,
  44000: 98,
  45000: 98,
};
export const cloudColor1 = '#FFFFFF';
export const cloudColor2 = '#CCCCCC';
export const icingIntensity = ['None', 'Trc', 'Lgt', 'Mod', 'Hvy'];
export const convectivePotential = ['None', 'Very Lo', 'Lo', 'Mod', 'Hi', 'Very Hi'];
export const emptyRouteData: Route = {
  id: undefined,
  departure: null,
  routeOfFlight: [],
  destination: null,
  altitude: 10000,
  useForecastWinds: false,
};
export const landingPages = {
  home: {
    url: '/home',
    name: 'Home',
  },
  dashboard: {
    url: '/dashboard',
    name: 'Dashboard',
  },
  map: {
    url: '/map',
    name: 'Map',
  },
  imagery: {
    url: '/imagery',
    name: 'Imagery',
  },
};

export const countryStates = [
  {
    Name: 'ALABAMA',
    CountryId: '1',
    Abbreviation: 'AL',
  },
  {
    Name: 'ALASKA',
    CountryId: '1',
    Abbreviation: 'AK',
  },
  {
    Name: 'NEW MEXICO',
    CountryId: '1',
    Abbreviation: 'NM',
  },
  {
    Name: 'NEW JERSEY',
    CountryId: '1',
    Abbreviation: 'NJ',
  },
  {
    Name: 'NEW HAMPSHIRE',
    CountryId: '1',
    Abbreviation: 'NH',
  },
  {
    Name: 'NEVADA',
    CountryId: '1',
    Abbreviation: 'NV',
  },
  {
    Name: 'NEBRASKA',
    CountryId: '1',
    Abbreviation: 'NE',
  },
  {
    Name: 'MONTANA',
    CountryId: '1',
    Abbreviation: 'MT',
  },
  {
    Name: 'MISSOURI',
    CountryId: '1',
    Abbreviation: 'MO',
  },
  {
    Name: 'MISSISSIPPI',
    CountryId: '1',
    Abbreviation: 'MS',
  },
  {
    Name: 'MINNESOTA',
    CountryId: '1',
    Abbreviation: 'MN',
  },
  {
    Name: 'MICHIGAN',
    CountryId: '1',
    Abbreviation: 'MI',
  },
  {
    Name: 'MASSACHUSETTS',
    CountryId: '1',
    Abbreviation: 'MA',
  },
  {
    Name: 'MARYLAND',
    CountryId: '1',
    Abbreviation: 'MD',
  },
  {
    Name: 'MAINE',
    CountryId: '1',
    Abbreviation: 'ME',
  },
  {
    Name: 'LOUISIANA',
    CountryId: '1',
    Abbreviation: 'LA',
  },
  {
    Name: 'KENTUCKY',
    CountryId: '1',
    Abbreviation: 'KY',
  },
  {
    Name: 'IOWA',
    CountryId: '1',
    Abbreviation: 'IA',
  },
  {
    Name: 'INDIANA',
    CountryId: '1',
    Abbreviation: 'IN',
  },
  {
    Name: 'ILLINOIS',
    CountryId: '1',
    Abbreviation: 'IL',
  },
  {
    Name: 'IDAHO',
    CountryId: '1',
    Abbreviation: '"ID"',
  },
  {
    Name: 'HAWAII',
    CountryId: '1',
    Abbreviation: 'HI',
  },
  {
    Name: 'GEORGIA',
    CountryId: '1',
    Abbreviation: 'GA',
  },
  {
    Name: 'FLORIDA',
    CountryId: '1',
    Abbreviation: 'FL',
  },
  {
    Name: 'DISTRICT OF COLUMBIA',
    CountryId: '1',
    Abbreviation: 'DC',
  },
  {
    Name: 'DELAWARE',
    CountryId: '1',
    Abbreviation: 'DE',
  },
  {
    Name: 'CONNECTICUT',
    CountryId: '1',
    Abbreviation: 'CL',
  },
  {
    Name: 'COLORADO',
    CountryId: '1',
    Abbreviation: 'CO',
  },
  {
    Name: 'CALIFORNIA',
    CountryId: '1',
    Abbreviation: 'CA',
  },
  {
    Name: 'ARKANSAS',
    CountryId: '1',
    Abbreviation: 'AR',
  },
  {
    Name: 'ARIZONA',
    CountryId: '1',
    Abbreviation: 'AZ',
  },
  {
    Name: 'NEW YORK',
    CountryId: '1',
    Abbreviation: 'NY',
  },
  {
    Name: 'KANSAS',
    CountryId: '1',
    Abbreviation: 'KS',
  },
  {
    Name: 'NORTH DAKOTA',
    CountryId: '1',
    Abbreviation: 'ND',
  },
  {
    Name: 'OHIO',
    CountryId: '1',
    Abbreviation: 'OH',
  },
  {
    Name: 'OKLAHOMA',
    CountryId: '1',
    Abbreviation: 'OK',
  },
  {
    Name: 'OREGON',
    CountryId: '1',
    Abbreviation: 'OK',
  },
  {
    Name: 'PENNSYLVANIA',
    CountryId: '1',
    Abbreviation: 'PA',
  },
  {
    Name: 'RHODE ISLAND',
    CountryId: '1',
    Abbreviation: 'RI',
  },
  {
    Name: 'NORTH CAROLINA',
    CountryId: '1',
    Abbreviation: 'NC',
  },
  {
    Name: 'SOUTH CAROLINA',
    CountryId: '1',
    Abbreviation: 'SC',
  },
  {
    Name: 'SOUTH DAKOTA',
    CountryId: '1',
    Abbreviation: 'SD',
  },
  {
    Name: 'TENNESSEE',
    CountryId: '1',
    Abbreviation: 'TN',
  },
  {
    Name: 'TEXAS',
    CountryId: '1',
    Abbreviation: 'TX',
  },
  {
    Name: 'UTAH',
    CountryId: '1',
    Abbreviation: 'UT',
  },
  {
    Name: 'VERMONT',
    CountryId: '1',
    Abbreviation: 'VT',
  },
  {
    Name: 'VIRGINIA',
    CountryId: '1',
    Abbreviation: 'VA',
  },
  {
    Name: 'WASHINGTON',
    CountryId: '1',
    Abbreviation: 'WA',
  },
  {
    Name: 'WEST VIRGINIA',
    CountryId: '1',
    Abbreviation: 'WV',
  },
  {
    Name: 'WISCONSIN',
    CountryId: '1',
    Abbreviation: 'WI',
  },
  {
    Name: 'WYOMING',
    CountryId: '1',
    Abbreviation: 'WY',
  },
  {
    Name: 'YUKON',
    CountryId: '2',
    Abbreviation: 'YT',
  },
  {
    Name: 'SASKATCHEWAN',
    CountryId: '2',
    Abbreviation: 'SK',
  },
  {
    Name: 'QUEBEC',
    CountryId: '2',
    Abbreviation: 'QC',
  },
  {
    Name: 'PRINCE EDWARD ISLAND',
    CountryId: '2',
    Abbreviation: 'PE',
  },
  {
    Name: 'ONTARIO',
    CountryId: '2',
    Abbreviation: 'ON',
  },
  {
    Name: 'NUNAVUT',
    CountryId: '2',
    Abbreviation: 'NU',
  },
  {
    Name: 'NORTHWEST TERRITORIES',
    CountryId: '2',
    Abbreviation: 'NT',
  },
  {
    Name: 'NOVA SCOTIA',
    CountryId: '2',
    Abbreviation: 'NS',
  },
  {
    Name: 'NEWFOUNDLAND AND LABRADOR',
    CountryId: '2',
    Abbreviation: 'NL',
  },
  {
    Name: 'NEW BRUNSWICK',
    CountryId: '2',
    Abbreviation: 'NB',
  },
  {
    Name: 'MANATOBA',
    CountryId: '2',
    Abbreviation: 'MB',
  },
  {
    Name: 'BRITISH COLUMBIA',
    CountryId: '2',
    Abbreviation: 'BC',
  },
  {
    Name: 'ALBERTA',
    CountryId: '2',
    Abbreviation: 'AB',
  },
  {
    Name: 'CHIAPAS',
    CountryId: '3',
    Abbreviation: 'Chis.',
  },
  {
    Name: 'CAMPECHE',
    CountryId: '3',
    Abbreviation: 'Camp.',
  },
  {
    Name: 'BAJA CALIFORNIA SUR',
    CountryId: '3',
    Abbreviation: 'B.C.S.',
  },
  {
    Name: 'BAJA CALIFORNIA',
    CountryId: '3',
    Abbreviation: 'B.C.',
  },
  {
    Name: 'AGUASCALIENTES',
    CountryId: '3',
    Abbreviation: 'Ags.',
  },
  {
    Name: 'CHIHUAHUA',
    CountryId: '3',
    Abbreviation: 'Chih.',
  },
  {
    Name: 'COAHUILA',
    CountryId: '3',
    Abbreviation: 'Coah.',
  },
  {
    Name: 'MEXICO CITY',
    CountryId: '3',
    Abbreviation: 'CDMX',
  },
  {
    Name: 'VERACRUZ',
    CountryId: '3',
    Abbreviation: 'Ver.',
  },
  {
    Name: 'TLAXCALA',
    CountryId: '3',
    Abbreviation: 'Tlax.',
  },
  {
    Name: 'TAMAULIPAS',
    CountryId: '3',
    Abbreviation: 'Tamps.',
  },
  {
    Name: 'TABASCO',
    CountryId: '3',
    Abbreviation: 'Tab.',
  },
  {
    Name: 'SONORA',
    CountryId: '3',
    Abbreviation: 'Son.',
  },
  {
    Name: 'SINALOA',
    CountryId: '3',
    Abbreviation: 'Sin.',
  },
  {
    Name: 'SAN LUIS POTOSÍ',
    CountryId: '3',
    Abbreviation: 'S.L.P.',
  },
  {
    Name: 'QUINTANA ROO',
    CountryId: '3',
    Abbreviation: 'Q.R.',
  },
  {
    Name: 'QUERÉTARO',
    CountryId: '3',
    Abbreviation: 'Qro.',
  },
  {
    Name: 'PUEBLA',
    CountryId: '3',
    Abbreviation: 'Pue.',
  },
  {
    Name: 'OAXACA',
    CountryId: '3',
    Abbreviation: 'Oax.',
  },
  {
    Name: 'NUEVO LEÓN',
    CountryId: '3',
    Abbreviation: 'N.L.',
  },
  {
    Name: 'NAYARIT',
    CountryId: '3',
    Abbreviation: 'Nay.',
  },
  {
    Name: 'MORELOS',
    CountryId: '3',
    Abbreviation: 'Mor.',
  },
  {
    Name: 'MICHOACÁN',
    CountryId: '3',
    Abbreviation: 'Mich.',
  },
  {
    Name: 'MÉXICO',
    CountryId: '3',
    Abbreviation: 'Edomex',
  },
  {
    Name: 'JALISCO',
    CountryId: '3',
    Abbreviation: 'Jal.',
  },
  {
    Name: 'HIDALGO',
    CountryId: '3',
    Abbreviation: 'Hgo.',
  },
  {
    Name: 'GUERRERO',
    CountryId: '3',
    Abbreviation: 'Gro.',
  },
  {
    Name: 'GUANAJUATO',
    CountryId: '3',
    Abbreviation: 'Gto.',
  },
  {
    Name: 'DURANGO',
    CountryId: '3',
    Abbreviation: 'Dgo.',
  },
  {
    Name: 'COLIMA',
    CountryId: '3',
    Abbreviation: 'Col.',
  },
  {
    Name: 'YUCATÁN',
    CountryId: '3',
    Abbreviation: 'Yuc.',
  },
  {
    Name: 'ZACATECAS',
    CountryId: '3',
    Abbreviation: 'Zac.',
  },
];
