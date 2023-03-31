import { StationMarkersLayerItemType } from './../../../interfaces/layerControl';

// timestamp in seconds
export const cacheStartTime = Math.floor(new Date('2023-01-24T21:00:00.000+08:00').getTime() / 1000);

export const timeSliderInterval = 5 * 60 * 1000; // in millisecond

export const windIconLimit = { windSpeed: 20, windGust: 25 };

export const paneOrders = {
  pirep: 680,
  routeLabel: 678,
  station: 676,
  routeLine: 674,
  polygonLabel: 650, // leaflet setting
};

export const WeatherCausings = {
  PCPN: 'precipitation',
  BR: 'mist',
  FG: 'fog',
  HZ: 'haze',
  FU: 'smoke',
  BLSN: 'blowing snow',
  CLDS: 'clouds',
};

export const UsePersonalMinsLayerItems: {
  departure: StationMarkersLayerItemType;
  enRoute: StationMarkersLayerItemType;
  destination: StationMarkersLayerItemType;
  flightCategory: StationMarkersLayerItemType;
  ceiling: StationMarkersLayerItemType;
  visibility: StationMarkersLayerItemType;
  crosswind: StationMarkersLayerItemType;
} = {
  departure: {
    value: 'departure',
    text: 'Departure',
  },
  enRoute: {
    value: 'en_route',
    text: 'En route',
  },
  destination: {
    value: 'destination',
    text: 'Destination',
  },
  flightCategory: {
    value: 'flight_category',
    text: 'Flight Category',
  },
  ceiling: {
    value: 'ceiling',
    text: 'Ceiling Height',
  },
  visibility: {
    value: 'visibility',
    text: 'Surface Visibility',
  },
  crosswind: {
    value: 'crosswind',
    text: 'Crosswinds',
  },
};

export const StationMarkersLayerItems: {
  usePersonalMinimum: StationMarkersLayerItemType;
  flightCategory: StationMarkersLayerItemType;
  ceilingHeight: StationMarkersLayerItemType;
  surfaceVisibility: StationMarkersLayerItemType;
  surfaceWindSpeed: StationMarkersLayerItemType;
  surfaceWindBarbs: StationMarkersLayerItemType;
  surfaceWindGust: StationMarkersLayerItemType;
  surfaceTemperature: StationMarkersLayerItemType;
  surfaceDewpoint: StationMarkersLayerItemType;
  dewpointDepression: StationMarkersLayerItemType;
  weather: StationMarkersLayerItemType;
} = {
  usePersonalMinimum: {
    value: 'personal_mins',
    text: 'Use Personal Mins',
  },
  flightCategory: {
    value: 'flight_category',
    text: 'Flight Category',
  },
  ceilingHeight: {
    value: 'ceiling',
    text: 'Ceiling Height',
  },
  surfaceVisibility: {
    value: 'visibility',
    text: 'Surface Visibility',
  },
  surfaceWindSpeed: {
    value: 'wind_speed',
    text: 'Surface Wind Speed',
  },
  surfaceWindBarbs: {
    value: 'wind_dir',
    text: 'Surface Wind Barbs',
  },
  surfaceWindGust: {
    value: 'wind_gust',
    text: 'Surface Wind Gust',
  },
  surfaceTemperature: {
    value: 'temp',
    text: 'Surface Temperature',
  },
  surfaceDewpoint: {
    value: 'dewpoint',
    text: 'Surface Dewpoint',
  },
  dewpointDepression: {
    value: 'dewpoint_depression',
    text: 'Dewpoint Depression',
  },
  weather: {
    value: 'weather',
    text: 'Weather',
  },
};

export const MetarSkyValuesToString = {
  CLR: 'Clear below 12,000 feet',
  SKC: 'Sky clear',
  CAVOK: 'use the same CLR icon.',
  FEW: 'Few',
  SCT: 'Scattered',
  BKN: 'Broken',
  OVC: 'Overcast',
  OVX: 'Indefinite ceiling',
};

export const POSITION_CLASSES: { [key: string]: string } = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

export const emptyGeoJson: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: new Array<GeoJSON.Feature>(),
};

export const pickupRadiusPx = 10;

export const wfsUrl1 = 'https://eztile1.ezwxbrief.com/geoserver/EZWxBrief/ows';
export const wfsUrl2 = 'https://eztile2.ezwxbrief.com/geoserver/EZWxBrief/ows';
export const wfsUrl3 = 'https://eztile3.ezwxbrief.com/geoserver/EZWxBrief/ows';
export const wfsUrl4 = 'https://eztile4.ezwxbrief.com/geoserver/EZWxBrief/ows';
