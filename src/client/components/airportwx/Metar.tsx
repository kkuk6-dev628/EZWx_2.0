import { useSelector } from 'react-redux';
import { selectCurrentAirport } from '../../store/airportwx/airportwx';
import { useGetAllAirportsQuery, useGetMetarTextQuery } from '../../store/airportwx/airportwxApi';
import { useEffect, useState } from 'react';
import { initialUserSettingsState } from '../../store/user/UserSettings';
import { getMetarCeilingCategory, getMetarVisibilityCategory } from '../map/common/AreoFunctions';

function getMinCeiling(matches: RegExpMatchArray): string {
  let minCeiling = 100000;
  let ceiling = '';
  matches.forEach((element) => {
    const c = parseInt(element.replace(/[^0-9]+/, ''));
    if (c < minCeiling) {
      minCeiling = c;
      ceiling = element;
    }
  });
  return ceiling;
}

export function colorCoding(text: string): string {
  const words = text.split(' ');
  const firstLine = [];
  words.forEach((item, index) => {
    let x = item.toUpperCase();
    if (x.endsWith('KT')) {
      const withoutKt = x.replace('KT', '');
      const splitG = withoutKt.split('G');
      const windDir = parseInt(splitG[0].slice(0, 3));
      const windSpeed = parseInt(splitG[0].slice(3, splitG[0].length - 3));
      const windGust = splitG.length > 1 ? parseInt(splitG[1]) : null;
      if (windSpeed > 14 || windGust > 19) {
        x = `<span class="brown">${x}</span>`;
      }
    } else if (x.endsWith('SM')) {
      const withoutSM = x.replace('SM', '').replace('M', '').replace('P', '');
      let visibility = parseFloat(withoutSM);
      if (withoutSM.includes('/')) {
        const sp = withoutSM.split('/');
        visibility = parseFloat(sp[0]) / parseFloat(sp[1]);
      }
      if (/^-?\d+$/.test(words[index - 1])) {
        visibility += parseInt(words[index - 1]);
        x = words[index - 1] + ' ' + x;
        firstLine.pop();
      }
      const [, visColor] = getMetarVisibilityCategory(visibility, initialUserSettingsState.personalMinimumsState);
      x = `<span style="color: ${visColor}">${x}</span>`;
    }
    firstLine.push(x);
  });
  let firstLineStr = firstLine.join(' ');
  firstLineStr = firstLineStr.replaceAll(
    /\S*TSRA|\bTS\b|\S*TSPL|\S*TSSN|\S*VCTS|\S*SHRA|\S*VCSH|\S*FZRA|\S*FZDZ/g,
    (match) => `<span style="color: red">${match}</span>`,
  );
  firstLineStr = firstLineStr.replaceAll(/\bFZFG\b|\bFG\b/g, (match) => `<span style="color: magenta">${match}</span>`);
  let ceiling = '';
  if (/BKN/.test(firstLineStr)) {
    const matches = /BKN\d+\w*/.exec(firstLineStr);
    ceiling = getMinCeiling(matches);
  } else if (/OVC/.test(firstLineStr)) {
    const matches = /OVC\d+\w*/.exec(firstLineStr);
    ceiling = getMinCeiling(matches);
  } else if (/FEW/.test(firstLineStr)) {
    const matches = /FEW\d+\w*/.exec(firstLineStr);
    ceiling = getMinCeiling(matches);
  } else if (/SCT/.test(firstLineStr)) {
    const matches = /SCT\d+\w*/.exec(firstLineStr);
    ceiling = getMinCeiling(matches);
  } else if (/VV/.test(firstLineStr)) {
    const matches = /VV\d+\w*/.exec(firstLineStr);
    ceiling = getMinCeiling(matches);
  }
  const c = parseInt(ceiling.replace(/[^0-9]+/, '')) * 100;
  let [, color] = getMetarCeilingCategory(c === 0 ? 1 : c, initialUserSettingsState.personalMinimumsState);
  if (ceiling.startsWith('FEW') || ceiling.startsWith('SCT')) {
    color = 'green';
  }
  firstLineStr = firstLineStr.replace(ceiling, `<span style="color: ${color}">${ceiling}</span>`);
  firstLineStr = firstLineStr.replace(/CLR|SKC/, (m) => `<span style="color: green">${m}</span>`);
  return firstLineStr;
}

const Metar = () => {
  const currentAirport = useSelector(selectCurrentAirport);
  const [airportId, setAirportId] = useState(currentAirport);
  const { data: metarText, isSuccess: loadedMetar } = useGetMetarTextQuery(airportId, {
    refetchOnMountOrArgChange: true,
  });
  const { data: airports, isSuccess: loadedAirports } = useGetAllAirportsQuery('');
  const [airportName, setAirportName] = useState('');

  useEffect(() => {
    if (currentAirport) {
      setAirportId(currentAirport);
      if (airports) {
        const airport = airports.find((x) => x.key === currentAirport);
        setAirportName(airport?.name);
      }
    }
  }, [airports, currentAirport]);

  return (
    <div className="metar-container">
      <div className="metar-scroll-content">
        <div className="airport-name">
          METAR - {airportName} ({airportId})
        </div>
        {metarText &&
          metarText.map((metar, i) => {
            const words = metar.raw_text.split(' ');
            const lines = [];
            let lineWords = [];
            words.forEach((word) => {
              if (word.startsWith('RMK')) {
                if (lineWords.length > 0) {
                  lines.push(lineWords.join(' '));
                  lineWords = [];
                }
              }
              lineWords.push(word);
            });
            if (lineWords.length > 0) {
              lines.push(lineWords.join(' '));
              lineWords = [];
            }
            return (
              <div className="metar-text" key={'metar-' + i}>
                {lines.map((line, index) => (
                  <div
                    key={`line-${i}-${index}`}
                    className="first-line"
                    dangerouslySetInnerHTML={{ __html: colorCoding(line) }}
                  />
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Metar;
