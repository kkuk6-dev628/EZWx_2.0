import { WeatherCausings } from './AreoConstants';

const getAltitudeString = (value: string): string => {
  if (value === 'SFC') {
    return 'Surface';
  } else if (value === 'FZL') {
    return 'FZL';
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

export { getAltitudeString, translateWeatherClausings };
