import { WeatherCausings } from './AreoConstants';
import geojson2svg, { Renderer } from 'geojson-to-svg';

const getAltitudeString = (
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

const translateWeatherClausings = (dueto: string): string => {
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

const convertTimeFormat = (time: string) => {
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

const simpleTimeFormat = (time: Date) => {
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

const getThumbnail = (feature, style) => {
  const svgString = geojson2svg()
    .styles({ Polygon: style })
    .data(feature)
    .render();
  return svgString;
};

const getBBoxFromPointZoom = (
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

const createElementFromHTML = (htmlString) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

const addLeadingZeroes = (str, max) => {
  str = str.toString();
  return str.length < max ? addLeadingZeroes('0' + str, max) : str;
};

const generateHash = (s: string): number => {
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

const getTimeRangeStart = () => {
  const currentDate = new Date();
  const origin = new Date();
  origin.setDate(currentDate.getDate() - 1);
  origin.setHours(12, 0, 0);
  origin.setMinutes(0);
  origin.setSeconds(0);
  origin.setMilliseconds(0);
  return origin;
};

const getQueryTime = (time: Date): string => {
  const start = new Date(time);
  start.setMinutes(time.getMinutes() - 75);
  return start.toISOString() + '/' + time.toISOString();
};

const diffMinutes = (date1: Date, date2: Date) => {
  const diff = (date1.getTime() - date2.getTime()) / (60 * 1000);
  return Math.abs(Math.round(diff));
};

export {
  getAltitudeString,
  translateWeatherClausings,
  convertTimeFormat,
  getThumbnail,
  getBBoxFromPointZoom,
  createElementFromHTML,
  addLeadingZeroes,
  generateHash,
  simpleTimeFormat,
  getTimeRangeStart,
  getQueryTime,
  diffMinutes,
};
