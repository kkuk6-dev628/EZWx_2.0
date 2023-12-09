import { useSelector } from 'react-redux';
import { selectCurrentAirport } from '../../store/airportwx/airportwx';
import { useGetTafTextQuery } from '../../store/airportwx/airportwxApi';
import { colorCoding } from './Metar';

const Taf = () => {
  const currentAirport = useSelector(selectCurrentAirport);
  const { data: tafText } = useGetTafTextQuery(currentAirport.key, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <div className="metar-container">
      <div className="metar-scroll-content">
        <div className="airport-name">
          TAF - {currentAirport.name} ({currentAirport.key})
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
                {lines.map((line, index) => {
                  let indentClass = '';
                  if (line.startsWith('FM') || line.startsWith('BECMG')) {
                    indentClass = 'indent20';
                  } else if (line.startsWith('TEMPO') || line.startsWith('PROB')) {
                    indentClass = 'indent40';
                  }
                  return (
                    <div
                      key={`line-${i}-${index}`}
                      className={indentClass}
                      dangerouslySetInnerHTML={{ __html: colorCoding(line) }}
                    />
                  );
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
