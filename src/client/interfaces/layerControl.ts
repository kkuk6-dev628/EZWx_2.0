export interface SkyCondition {
  skyCover: string;
  cloudBase: number;
}

export type RoutePointType = 'departure' | 'en_route' | 'destination';

export type EvaluationType = 'flight_category' | 'ceiling' | 'visibility' | 'crosswind';

export type StationMarkerType =
  | 'personal_mins'
  | 'flight_category'
  | 'ceiling'
  | 'visibility'
  | 'wind_speed'
  | 'wind_dir'
  | 'wind_gust'
  | 'temp'
  | 'dewpoint'
  | 'dewpoint_depression'
  | 'weather';

export type StationMarkersLayerItemType = {
  value: StationMarkerType | EvaluationType | RoutePointType;
  text: string;
};

export interface SublayerState {
  name: string;
  checked: boolean;
}

export interface LayerState {
  checked: boolean;
  opacity: number;
  name: string;
  expanded: boolean;
}

export interface StationMarkersLayerState extends LayerState {
  usePersonalMinimums: {
    routePointType: RoutePointType;
    evaluationType: EvaluationType;
  };
  markerType: StationMarkerType;
  flightCategory: {
    all: SublayerState;
    vfr: SublayerState;
    mvfr: SublayerState;
    ifr: SublayerState;
    lifr: SublayerState;
  };
}

export interface RadarLayerState extends LayerState {
  baseReflectivity: SublayerState;
  echoTopHeight: SublayerState;
  forecastRadar: SublayerState;
}

export interface SigmetsLayerState extends LayerState {
  all: SublayerState;
  convection: SublayerState;
  outlooks: SublayerState;
  turbulence: SublayerState;
  airframeIcing: SublayerState;
  dust: SublayerState;
  ash: SublayerState;
  international: SublayerState;
  other: SublayerState;
}

export interface GairmetLayerState extends LayerState {
  all: SublayerState;
  airframeIcing: SublayerState;
  multiFrzLevels: SublayerState;
  turbulenceHi: SublayerState;
  turbulenceLow: SublayerState;
  ifrConditions: SublayerState;
  mountainObscuration: SublayerState;
  nonconvectiveLlws: SublayerState;
  sfcWinds: SublayerState;
}

export interface PirepLayerState extends LayerState {
  urgentOnly: SublayerState;
  all: SublayerState;
  icing: SublayerState;
  turbulence: SublayerState;
  weatherSky: SublayerState;
  altitude: {
    all: boolean;
    name: string;
    min: number;
    max: number;
    valueMin: number;
    valueMax: number;
    unit: string;
  };
  time: { name: string; hours: number; max: number };
}

export interface CwaLayerState extends LayerState {
  all: SublayerState;
  airframeIcing: SublayerState;
  turbulence: SublayerState;
  ifrConditions: SublayerState;
  convection: SublayerState;
  other: SublayerState;
}

export interface LayerControlState {
  id?: number;
  userId?: number;
  show: boolean;
  stationMarkersState: StationMarkersLayerState;
  radarState: RadarLayerState;
  sigmetState: SigmetsLayerState;
  gairmetState: GairmetLayerState;
  pirepState: PirepLayerState;
  cwaState: CwaLayerState;
}
export interface BaseMapLayerControlState {
  id?: number;
  userId?: number;
  show: boolean;
  bounds: any;
  usProvincesState: LayerState;
  canadianProvincesState: LayerState;
  countryWarningAreaState: LayerState;
  streetState: LayerState;
  topoState: LayerState;
  terrainState: LayerState;
  darkState: LayerState;
  satelliteState: LayerState;
}

export interface LayerControlSlidersState {
  radarOpacity: number;
  pirepAltitudeMin: number;
  pirepAltitudeMax: number;
}
