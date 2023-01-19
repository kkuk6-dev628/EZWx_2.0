import {
  PersonalMinimumItem,
  PersonalMinimums,
} from './../../../store/user/UserSettings';
import {
  MetarMarkerTypes,
  MetarSkyValuesToString,
  WeatherCausings,
} from './AreoConstants';
import geojson2svg, { Renderer } from 'geojson-to-svg';

export const getAltitudeString = (
  value: string,
  isHundred = true,
  fzlbase?: string,
  fzltop?: string,
): string => {
  if (value === 'SFC' || value == '0') {
    return 'Surface';
  } else if (value === 'FZL') {
    let fzlstring = '';
    if (fzlbase === 'SFC') {
      fzlstring = 'Surface to';
    } else if (!isNaN(parseInt(fzlbase))) {
      fzlstring = `${parseInt(fzlbase) * (isHundred ? 100 : 1)} to`;
    }
    if (!isNaN(parseInt(fzltop))) {
      fzlstring += ` ${parseInt(fzltop) * (isHundred ? 100 : 1)} ft MSL`;
    }
    return fzlstring;
  } else if (!isNaN(parseInt(value))) {
    return parseInt(value) * (isHundred ? 100 : 1) + ' ft MSL';
  }
};

export const translateWeatherClausings = (dueto: string): string => {
  if (!dueto) {
    return '';
  }
  const weatherCausings = dueto.slice(dueto.lastIndexOf(' ') + 1);
  const splitWeatherCausing = weatherCausings.split('/');
  const wc = splitWeatherCausing.map((element) => {
    if (!WeatherCausings.hasOwnProperty(element)) {
      return;
    }
    return WeatherCausings[element];
  });
  return wc
    .filter((n) => n)
    .join(', ')
    .replace(/,(?=[^,]+$)/, ' and');
};

export const convertTimeFormat = (time: string) => {
  const dateObj = new Date(time);
  return `${dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} ${dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  })}`;
};

export const simpleTimeFormat = (time: Date) => {
  return `${time.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
  })} ${time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  })}`;
};

export const simpleTimeOnlyFormat = (time: Date) => {
  return `${time.getUTCHours()}${time.getUTCMinutes()}Z`;
};

export const getThumbnail = (feature, style) => {
  const svgString = geojson2svg()
    .styles({ Polygon: style })
    .data(feature)
    .render();
  return svgString;
};

export const getBBoxFromPointZoom = (
  pixelDelta: number,
  latlng: any,
  zoom: number,
): any => {
  const latlngDelta =
    (pixelDelta * Math.cos((Math.PI * latlng.lat) / 180)) / Math.pow(2, zoom);
  return {
    latMin: latlng.lat - latlngDelta / 2,
    latMax: latlng.lat + latlngDelta / 2,
    lngMin: latlng.lng - latlngDelta / 2,
    lngMax: latlng.lng + latlngDelta / 2,
  };
};

export const createElementFromHTML = (htmlString) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

export const addLeadingZeroes = (str, max) => {
  str = str.toString();
  return str.length < max ? addLeadingZeroes('0' + str, max) : str;
};

export const generateHash = (s: string): number => {
  let hash = 0,
    i,
    chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getTimeRangeStart = () => {
  const currentDate = new Date();
  const origin = new Date();
  origin.setDate(currentDate.getDate() - 1);
  origin.setHours(12, 0, 0);
  origin.setMinutes(0);
  origin.setSeconds(0);
  origin.setMilliseconds(0);
  return origin;
};

export const getQueryTime = (time: Date): string => {
  const start = new Date(time);
  start.setMinutes(time.getMinutes() - 75);
  start.setSeconds(0);
  start.setMilliseconds(0);
  return start.toISOString() + '/' + time.toISOString();
};

export const diffMinutes = (date1: Date, date2: Date) => {
  const diff = (date1.getTime() - date2.getTime()) / (60 * 1000);
  return Math.abs(Math.round(diff));
};

export const getMetarVisibilityCategory = (
  visibility: number,
  personalMinimums: PersonalMinimums,
): any[] => {
  if (visibility === null || !isFinite(visibility)) {
    return [];
  }
  const visibilityMinimumsValues = Object.values(personalMinimums).map(
    (val: PersonalMinimumItem) => val.visibility,
  );

  let visibilityMinimum = visibilityMinimumsValues.length - 1;
  for (let i = 0; i < visibilityMinimumsValues.length; i++) {
    if (visibilityMinimumsValues[i] > visibility) {
      visibilityMinimum = i - 1;
      break;
    }
  }
  const cat = Object.keys(personalMinimums)[visibilityMinimum];
  const color = personalMinimums[cat].color;
  return [cat, color, visibilityMinimum];
};

export const getMetarCeilingCategory = (
  ceiling: number,
  personalMinimums: PersonalMinimums,
): any[] => {
  if (ceiling === null || !isFinite(ceiling)) {
    return [undefined, '#000', Infinity];
  }
  const ceilingMinimumsValues = Object.values(personalMinimums).map(
    (val: PersonalMinimumItem) => val.ceiling,
  );

  let ceilingMinimum = ceilingMinimumsValues.length - 1;
  for (let i = 0; i < ceilingMinimumsValues.length; i++) {
    if (ceilingMinimumsValues[i] > ceiling) {
      ceilingMinimum = i - 1;
      break;
    }
  }
  const cat = Object.keys(personalMinimums)[ceilingMinimum];
  const color = personalMinimums[cat].color;
  return [cat, color, ceilingMinimum];
};

export const getSkyCeilingValues = (
  feature: GeoJSON.Feature,
  markerType,
): any[] => {
  let skyMin = -1;
  const skyValues = Object.keys(MetarSkyValuesToString);
  let ceiling;
  let ceilingPos = 0;
  for (let i = 1; i <= 6; i++) {
    const sky = feature.properties[`sky_cover_${i}`];
    const index = skyValues.indexOf(sky);

    // get ceiling height values
    if (index > -1 && index > skyMin) {
      skyMin = index;
      // consider only BKN, OVC and OVX
      if (index >= 5) ceilingPos = i;
    }
  }
  const sky = skyValues[skyMin];
  if (skyMin === 7) {
    ceiling = feature.properties.vert_vis_ft;
  } else {
    ceiling = feature.properties[`cloud_base_ft_agl_${ceilingPos}`];
  }
  // if (
  //   feature.properties.vert_vis_ft &&
  //   !isNaN(feature.properties.vert_vis_ft)
  // ) {
  //   sky = 'OVX';
  //   ceiling = feature.properties.vert_vis_ft;
  // }
  return [sky, ceiling];
};
export const getMetarDecodedWxString = (wxString: string): string => {
  let result = wxString;
  switch (wxString) {
    case 'FZRA':
      result = 'Moderate freezing rain';
      break;
    case '-FZRA':
      result = 'Light freezing rain';
      break;
    case '+FZRA':
      result = 'Heavy freezing rain';
      break;
    case '-FZRA BR':
      result = 'Light freezing rain and mist';
      break;
    case 'FZRA BR':
      result = 'Moderate freezing rain and mist';
      break;
    case '+FZRA BR':
      result = 'Heavy freezing rain and mist';
      break;
    case '-FZRA FG':
      result = 'Light freezing rain and fog';
      break;
    case 'FZRA FG':
      result = 'Moderate freezing rain and fog';
      break;
    case '+FZRA FG':
      result = 'Heavy freezing rain and fog';
      break;
    case '-FZRA HZ':
      result = 'Light freezing rain and haze';
      break;
    case 'FZRA HZ':
      result = 'Moderate freezing rain and haze';
      break;
    case '+FZRA HZ':
      result = 'Heavy freezing rain and haze';
      break;
    case '-FZRA FZFG':
      result = 'Light freezing rain in freezing fog';
      break;
    case 'FZRA FZFG':
      result = 'Moderate freezing rain in freezing fog';
      break;
    case '+FZRA FZFG':
      result = 'Heavy freezing rain in freezing fog';
      break;
    case 'FZDZ':
      result = 'Moderate freezing drizzle';
      break;
    case '-FZDZ':
      result = 'Light freezing drizzle';
      break;
    case '+FZDZ':
      result = 'Heavy freezing drizzle';
      break;
    case 'RA':
      result = 'Moderate rain';
      break;
    case '-RA':
      result = 'Light rain';
      break;
    case '+RA':
      result = 'Heavy rain';
      break;
    case 'DZ':
      result = 'Moderate drizzle';
      break;
    case '-DZ':
      result = 'Light drizzle';
      break;
    case '+DZ':
      result = 'Heavy drizzle';
      break;
    case '-DZ BR':
      result = 'Light drizzle and mist';
      break;
    case 'DZ BR':
      result = 'Moderate drizzle and mist';
      break;
    case '+DZ BR':
      result = 'Heavy drizzle and mist';
      break;
    case 'PL':
      result = 'Moderate ice pellets';
      break;
    case '-PL':
      result = 'Light ice pellets';
      break;
    case '+PL':
      result = 'Heavy ice pellets';
      break;
    case '-PL BR':
      result = 'Light ice pellets and mist';
      break;
    case 'PL BR':
      result = 'Moderate ice pellets and mist';
      break;
    case '+PL BR':
      result = 'Heavy ice pellets and mist';
      break;
    case '-PL FG':
      result = 'Light ice pellets and fog';
      break;
    case 'PL FG':
      result = 'Moderate ice pellets and fog';
      break;
    case '+PL FG':
      result = 'Heavy ice pellets and fog';
      break;
    case '-PL HZ':
      result = 'Light ice pellets and haze';
      break;
    case 'PL HZ':
      result = 'Moderate ice pellets and haze';
      break;
    case '+PL HZ':
      result = 'Heavy ice pellets and haze';
      break;
    case 'TSRA':
      result = 'Thunderstorms and moderate rain';
      break;
    case '-TSRA':
      result = 'Thunderstorms and light rain';
      break;
    case '+TSRA':
      result = 'Thunderstorms and heavy rain';
      break;
    case 'TSRA BR':
      result = 'Thunderstorms, moderate rain and mist';
      break;
    case '-TSRA BR':
      result = 'Thunderstorms, light rain and mist';
      break;
    case '+TSRA BR':
      result = 'Thunderstorms, heavy rain and mist';
      break;
    case 'TSRA FG':
      result = 'Thunderstorms, moderate rain and fog';
      break;
    case '-TSRA FG':
      result = 'Thunderstorms, light rain and fog';
      break;
    case '+TSRA FG':
      result = 'Thunderstorms, heavy rain and fog';
      break;
    case 'TSSN':
      result = 'Thunderstorms and moderate snow';
      break;
    case '-TSSN':
      result = 'Thunderstorms and light snow';
      break;
    case '+TSSN':
      result = 'Thunderstorms and heavy snow';
      break;
    case 'SN':
      result = 'Moderate snow';
      break;
    case '-SN':
      result = 'Light snow';
      break;
    case '+SN':
      result = 'Heavy snow';
      break;
    case '-SG':
      result = 'Light snow grains';
      break;
    case 'SG':
      result = 'Moderate snow grains';
      break;
    case '+SG':
      result = 'Heavy snow grains';
      break;
    case '-SN BR':
      result = 'Light snow and mist';
      break;
    case 'SN BR':
      result = 'Moderate snow and mist';
      break;
    case '+SN BR':
      result = 'Heavy snow and mist';
      break;
    case '-SN -RA':
      result = 'Light snow and light rain mixed';
      break;
    case '-SHSN DRSN':
      result = 'Light snow showers and drifting snow';
      break;
    case 'SHSN DRSN':
      result = 'Moderate snow showers and drifting snow';
      break;
    case '+SHSN DRSN':
      result = 'Heavy snow showers and drifting snow';
      break;
    case '-SN DRSN':
      result = 'Light snow and drifting snow';
      break;
    case 'SN DRSN':
      result = 'Moderate snow and drifting snow';
      break;
    case '+SN DRSN':
      result = 'Heavy snow and drifting snow';
      break;
    case '-SG DRSN':
      result = 'Light snow grains and drifting snow';
      break;
    case 'SG DRSN':
      result = 'Moderate snow grains and drifting snow';
      break;
    case '+SG DRSN':
      result = 'Heavy snow grains and drifting snow';
      break;
    case 'SN FZFG BLSN':
      result = 'Moderate snow and freezing fog with blowing snow';
      break;
    case '-SN FZFG BLSN':
      result = 'Light snow and freezing fog with blowing snow';
      break;
    case '+SN FZFG BLSN':
      result = 'Heavy snow and freezing fog with blowing snow';
      break;
    case '-SHSN FZFG BLSN':
      result = 'Light snow showers and freezing fog with blowing snow';
      break;
    case 'SHSN FZFG BLSN':
      result = 'Moderate snow showers and freezing fog with blowing snow';
      break;
    case '+SHSN FZFG BLSN':
      result = 'Heavy snow showers and freezing fog with blowing snow';
      break;
    case 'SHRA':
      result = 'Moderate rain showers';
      break;
    case '-SHRA':
      result = 'Light rain showers';
      break;
    case '+SHRA':
      result = 'Heavy rain showers';
      break;
    case 'SHSN':
      result = 'Moderate snow showers';
      break;
    case '-SHSN':
      result = 'Light snow showers';
      break;
    case '+SHSN':
      result = 'Heavy snow showers';
      break;
    case 'SHPL':
      result = 'Moderate ice pellet showers';
      break;
    case '-SHPL':
      result = 'Light ice pellet showers';
      break;
    case '+SHPL':
      result = 'Heavy ice pellet showers';
      break;
    case 'SHGS':
      result = 'Moderate snow pellet showers';
      break;
    case '-SHGS':
      result = 'Light snow pellet showers';
      break;
    case '+SHGS':
      result = 'Heavy snow pellet showers';
      break;
    case 'SHGR':
      result = 'Moderate hail showers';
      break;
    case '-SHGR':
      result = 'Light hail showers';
      break;
    case '+SHGR':
      result = 'Heavy hail showers';
      break;
    case 'P6SM':
      result = 'Better than 6 miles visibility';
      break;
    case 'SNPL':
      result = 'Moderate snow mixed with ice pellets';
      break;
    case '-SNPL':
      result = 'Light snow mixed with ice pellets';
      break;
    case '+SNPL':
      result = 'Heavy snow mixed with ice pellets';
      break;
    case 'FZDZSN':
      result = 'Freezing drizzle and snow';
      break;
    case 'FZRASN':
      result = 'Freezing rain and snow';
      break;
    case 'FZRAPL':
      result = 'Freezing rain and ice pellets';
      break;
    case 'RAPL':
      result = 'Moderate rain mixed with ice pellets';
      break;
    case '-RAPL':
      result = 'Light rain mixed with ice pellets';
      break;
    case '+RAPL':
      result = 'Heavy rain mixed with ice pellets';
      break;
    case '-RA BR':
      result = 'Light rain and mist';
      break;
    case 'RA BR':
      result = 'Moderate rain and mist';
      break;
    case '+RA BR':
      result = 'Heavy rain and mist';
      break;
    case '-RA BCFG':
      result = 'Light rain and patchy fog';
      break;
    case 'RA BCFG':
      result = 'Moderate rain and patchy fog';
      break;
    case '+RA BCFG':
      result = 'Heavy rain and patchy fog';
      break;
    case 'BR BCFG':
      result = 'Mist and patchy fog';
      break;
    case 'BCFG BR':
      result = 'Patchy fog and mist';
      break;
    case 'BCFG HZ':
      result = 'Patchy fog and haze';
      break;
    case '-RA HZ':
      result = 'Light rain and haze';
      break;
    case 'RA HZ':
      result = 'Moderate rain and haze';
      break;
    case '+RA HZ':
      result = 'Heavy rain and haze';
      break;
    case '-RA FG':
      result = 'Light rain and fog';
      break;
    case 'RA FG':
      result = 'Moderate rain and fog';
      break;
    case '+RA FG':
      result = 'Heavy rain and fog';
      break;
    case 'PLRA':
      result = 'Moderate ice pellets mixed with rain';
      break;
    case '-PLRA':
      result = 'Light ice pellets mixed with rain';
      break;
    case '+PLRA':
      result = 'Heavy ice pellets mixed with rain';
      break;
    case 'PLSN':
      result = 'Moderate ice pellets mixed with snow';
      break;
    case '-PLSN':
      result = 'Light ice pellets mixed with snow';
      break;
    case '+PLSN':
      result = 'Heavy ice pellets mixed with snow';
      break;
    case 'TSSNGS':
      result = 'Thunderstorms, moderate snow and hail';
      break;
    case '-TSSNGS':
      result = 'Thunderstorms, light snow and hail';
      break;
    case '+TSSNGS':
      result = 'Thunderstorms, heavy snow and hail';
      break;
    case 'MIFG':
      result = 'Shallow fog';
      break;
    case 'MIFG BR':
      result = 'Shallow fog and mist';
      break;
    case '-RA -SN BR':
      result = 'Light rain and snow in mist';
      break;
    case '-SN -RA BR':
      result = 'Light snow and rain in mist';
      break;
    case '-VCTSRA':
      result = 'Thunderstorms in the vicinity with light rain';
      break;
    case 'VCTSRA':
      result = 'Thunderstorms in the vicinity with moderate rain';
      break;
    case '+VCTSRA':
      result = 'Thunderstorms in the vicinity with heavy rain';
      break;
    case 'HZ DS SQ':
      result = 'Dust storms and squalls with haze';
      break;
    case 'HZ DS':
      result = 'Dust storms with haze';
      break;
    case 'BR UP':
      result = 'Unknown precipitation type and mist';
      break;
    case 'SS':
      result = 'Moderate sandstorm';
      break;
    case '-SS':
      result = 'Light sandstorm';
      break;
    case '+SS':
      result = 'Heavy sandstorm';
      break;
    case 'DS':
      result = 'Moderate duststorm';
      break;
    case '-DS':
      result = 'Light duststorm';
      break;
    case '+DS':
      result = 'Heavy duststorm';
      break;
    case 'TSRAGR':
      result = 'Thunderstorms, moderate rain and hail';
      break;
    case '-TSRAGR':
      result = 'Thunderstorms, light rain and hail';
      break;
    case '+TSRAGR':
      result = 'Thunderstorms, heavy rain and hail';
      break;
    case 'TSPL':
      result = 'Thunderstorms and moderate ice pellets';
      break;
    case '-TSPL':
      result = 'Thunderstorms and light ice pellets';
      break;
    case '+TSPL':
      result = 'Thunderstorms and heavy ice pellets';
      break;
    case '+FC':
      result = 'Tornado or waterspout';
      break;
    case 'SN BLSN':
      result = 'Moderate snow and blowing snow';
      break;
    case '-SN BLSN':
      result = 'Light snow and blowing snow';
      break;
    case '+SN BLSN':
      result = 'Heavy snow and blowing snow';
      break;
    //no intensity mods
    case 'BLPY':
      result = 'Spray';
      break;
    case 'UP':
      result = 'Unknown precipitation type';
      break;
    case 'SQ':
      result = 'Squalls';
      break;
    case 'FG':
      result = 'Fog';
      break;
    case '-SN FG':
      result = 'Light snow and fog';
      break;
    case 'SN FG':
      result = 'Moderate snow and fog';
      break;
    case '+SN FG':
      result = 'Heavy snow and fog';
      break;
    case 'DRSN':
      result = 'Drifting snow';
      break;
    case 'DRSA':
      result = 'Driving sand';
      break;
    case 'PRFG':
      result = 'Partial fog';
      break;
    case 'BCFG':
      result = 'Patchy fog';
      break;
    case 'BR':
      result = 'Mist';
      break;
    case 'HZ':
      result = 'Haze';
      break;
    case 'FC':
      result = 'Funnel cloud';
      break;
    case 'BLSA':
      result = 'Blowing sand';
      break;
    case 'BLSN':
      result = 'Blowing snow';
      break;
    case 'BLDU':
      result = 'Blowing dust';
      break;
    case 'SKC':
      result = 'Sky clear';
      break;
    case 'CLR':
      result = 'Sky clear below 12,000 feet';
      break;
    case 'TS':
      result = 'Thunderstorms';
      break;
    case 'TS BR':
      result = 'Thunderstorms and mist';
      break;
    case 'TS -FZRA BR':
      result = 'Thunderstorms with light freezing rain and mist';
      break;
    case 'TS FZRA BR':
      result = 'Thunderstorms with moderate freezing rain and mist';
      break;
    case 'TS +FZRA BR':
      result = 'Thunderstorms with heavy freezing rain and mist';
      break;
    case 'TS -FZRA FG':
      result = 'Thunderstorms with light freezing rain and fog';
      break;
    case 'TS FZRA FG':
      result = 'Thunderstorms with moderate freezing rain and fog';
      break;
    case 'TS +FZRA FG':
      result = 'Thunderstorms with heavy freezing rain and fog';
      break;
    case 'TS -FZRA HZ':
      result = 'Thunderstorms with light freezing rain and haze';
      break;
    case 'TS FZRA HZ':
      result = 'Thunderstorms with moderate freezing rain and haze';
      break;
    case 'TS +FZRA HZ':
      result = 'Thunderstorms with heavy freezing rain and haze';
      break;
    case 'TSGS':
      result = 'Thunderstorms and snow pellets';
      break;
    case 'TSGR':
      result = 'Thunderstorms and hail';
      break;
    case 'FZFG':
      result = 'Freezing fog';
      break;
    case '-SN FZFG':
      result = 'Light snow and freezing fog';
      break;
    case 'SN FZFG':
      result = 'Moderate snow and freezing fog';
      break;
    case '+SN FZFG':
      result = 'Heavy snow and freezing fog';
      break;
    case 'VCSH':
      result = 'Showers in the vicinity';
      break;
    case 'DRSN VCSH':
      result = 'Drifting snow and showers in the vicinity';
      break;
    case 'VCTS':
      result = 'Thunderstorms in the vicinity';
      break;
    case 'VCTS BR':
      result = 'Thunderstorms in the vicinity and mist';
      break;
    case 'VCTS HZ':
      result = 'Thunderstorms in the vicinity and haze';
      break;
    case 'VCTS -RA':
      result = 'Thunderstorms in the vicinity and light rain';
      break;
    case 'VCTS RA':
      result = 'Thunderstorms in the vicinity and moderate rain';
      break;
    case 'VCTS +RA':
      result = 'Thunderstorms in the vicinity and heavy rain';
      break;
    case 'VCTS +RA BR':
      result = 'Thunderstorms in the vicinity with heavy rain and mist';
      break;
    case 'VCTS RA BR':
      result = 'Thunderstorms in the vicinity with moderate rain and mist';
      break;
    case 'VCTS -RA BR':
      result = 'Thunderstorms in the vicinity with light rain and mist';
      break;
    case '+RA BR VCTS':
      result = 'Heavy rain and mist with thunderstorms in the vicinity';
      break;
    case 'RA BR VCTS':
      result = 'Moderate rain and mist with thunderstorms in the vicinity';
      break;
    case '-RA BR VCTS':
      result = 'Light rain and mist with thunderstorms in the vicinity';
      break;
    case 'VCSS':
      result = 'Sandstorm in the vicinity';
      break;
    case 'VCDS':
      result = 'Dust storm in the vicinity';
      break;
    case 'VCFG':
      result = 'Fog in the vicinity';
      break;
    case 'SA':
      result = 'Sand';
      break;
    case 'DU':
      result = 'Dust';
      break;
    case 'VA':
      result = 'Volcanic ash';
      break;
    case 'FU':
      result = 'Smoke';
      break;
    case 'HZ FU':
      result = 'Haze and smoke';
      break;
    case 'FU HZ':
      result = 'Smoke and haze';
      break;
    case 'BR FU':
      result = 'Mist and smoke';
      break;
    case 'GR':
      result = 'Hail';
      break;
    case 'GS':
      result = 'Snow grains';
      break;
    case 'IC':
      result = 'Ice cystals';
      break;
  }
  return result;
};
