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
  })}`;
};

const simpleTimeFormat = (time: Date) => {
  return `${time.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  })} ${time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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

export {
  getAltitudeString,
  translateWeatherClausings,
  convertTimeFormat,
  getThumbnail,
  getBBoxFromPointZoom,
  createElementFromHTML,
  addLeadingZeroes,
  simpleTimeFormat,
};
