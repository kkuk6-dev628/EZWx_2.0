import { useSelector } from 'react-redux';
import { selectCurrentAirport } from '../../store/airportwx/airportwx';
import { useGetMetarTextQuery, useGetTafTextQuery } from '../../store/airportwx/airportwxApi';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { useEffect, useState } from 'react';
import { initialUserSettingsState } from '../../store/user/UserSettings';
import { getMetarCeilingCategory, getMetarVisibilityCategory } from '../map/common/AreoFunctions';
import { isNumberObject } from 'util/types';
import { colorCoding } from './Metar';

const Taf = () => {
  const currentAirport = useSelector(selectCurrentAirport);
  const [airportId, setAirportId] = useState(currentAirport);
  const { data: tafText } = useGetTafTextQuery(airportId, {
    refetchOnMountOrArgChange: true,
  });
  const { data: airports } = useGetAirportQuery('');
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
          TAF - {airportName} ({airportId})
        </div>
        {tafText && tafText.length > 0 ? (
          tafText.map((metar, i) => {
            const words = metar.raw_text.split(' ');
            const lines = [];
            let lineWords = [];
            words.forEach((word) => {
              if (
                word.startsWith('FM') ||
                word.startsWith('TEMPO') ||
                word.startsWith('PROB') ||
                word.startsWith('BECMG')
              ) {
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
                {lines.map((line) => {
                  let indentClass = '';
                  if (line.startsWith('FM')) {
                    indentClass = 'indent20';
                  } else if (line.startsWith('TEMPO' || line.startsWith('PROB') || line.startsWith('BECMG'))) {
                    indentClass = 'indent40';
                  }
                  return <div className={indentClass} dangerouslySetInnerHTML={{ __html: colorCoding(line) }} />;
                })}
              </div>
            );
          })
        ) : (
          <div className="nodata-message">There are no TAFs available for this airport</div>
        )}
      </div>
    </div>
  );
};

export default Taf;
