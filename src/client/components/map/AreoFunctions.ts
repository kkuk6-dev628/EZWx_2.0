import { WeatherCausings } from './AreoConstants';
import geojson2svg, { Renderer } from 'geojson-to-svg';

const getAltitudeString = (
  value: string,
  fzlbase: string,
  fzltop: string,
): string => {
  if (value === 'SFC') {
    return 'Surface';
  } else if (value === 'FZL') {
    let fzlstring = '';
    if (fzlbase === 'SFC') {
      fzlstring = 'Surface to';
    } else if (!isNaN(parseInt(fzlbase))) {
      fzlstring = `${parseInt(fzlbase) * 100} to`;
    }
    if (!isNaN(parseInt(fzltop))) {
      fzlstring += ` ${parseInt(fzltop) * 100} ft MSL`;
    }
    return fzlstring;
  } else if (!isNaN(parseInt(value))) {
    return parseInt(value) * 100 + ' ft MSL';
  }
};

const translateWeatherClausings = (dueto: string): string => {
  if (!dueto) {
    return '';
  }
  const weatherCausings = dueto.slice(dueto.lastIndexOf(' ') + 1);
  const splitWeatherCausing = weatherCausings.split('/');
  const wc = splitWeatherCausing.map((element) => {
    return WeatherCausings[element];
  });
  return wc.join(', ').replace(/,(?=[^,]+$)/, ' and');
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

const getThumbnail = (feature, style) => {
  const svgString = geojson2svg()
    .styles({ Polygon: style })
    .data(feature)
    .render();
  const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  console.log(svg.documentElement);
  return svgString;
};

export {
  getAltitudeString,
  translateWeatherClausings,
  convertTimeFormat,
  getThumbnail,
};
