export const WeatherCausings = {
  PCPN: 'precipitation',
  BR: 'mist',
  FG: 'fog',
  HZ: 'haze',
  FU: 'smoke',
  BLSN: 'blowing snow',
  CLDS: 'clouds',
};

export const MetarMarkerTypes = {
  flightCategory: {
    value: 'flightCategory',
    text: 'Flight Category',
  },
  ceilingHeight: {
    value: 'ceilingHeight',
    text: 'Ceiling Height',
  },
  surfaceVisibility: {
    value: 'surfaceVisibility',
    text: 'Surface Visibility',
  },
  surfaceWindSpeed: {
    value: 'surfaceWindSpeed',
    text: 'Surface Wind Speed',
  },
  surfaceWindBarbs: {
    value: 'surfaceWindBarbs',
    text: 'Surface Wind Barbs',
  },
  surfaceWindGust: {
    value: 'surfaceWindGust',
    text: 'Surface Wind Gust',
  },
  surfaceTemperature: {
    value: 'surfaceTemperature',
    text: 'Surface Temperature',
  },
  surfaceDewpoint: {
    value: 'surfaceDewpoint',
    text: 'Surface Dewpoint',
  },
  dewpointDepression: {
    value: 'dewpointDepression',
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

// timestamp in seconds
export const cacheStartTime = Math.floor(
  new Date('2023-01-24T21:00:00.000+08:00').getTime() / 1000,
);
