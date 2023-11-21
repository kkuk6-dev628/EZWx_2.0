import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentAirport, selectCurrentAirportPos } from '../../store/airportwx/airportwx';
import { useGetAfdTextQuery, useGetAllAirportsQuery } from '../../store/airportwx/airportwxApi';

const Afd = () => {
  const currentAirport = useSelector(selectCurrentAirport);
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const [airportId, setAirportId] = useState(currentAirport);
  const { data: afdText } = useGetAfdTextQuery(currentAirportPos, {
    refetchOnMountOrArgChange: true,
    skip: currentAirportPos === null,
  });
  const { data: airports } = useGetAllAirportsQuery('');
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
          AFD - {airportName} ({airportId})
        </div>
        {afdText ? (
          <div
            className="metar-text"
            dangerouslySetInnerHTML={{
              __html: afdText.afd_content.replace(
                /\.AVIATION[^&]*&&/i,
                (x) => `<span class="afd-highlight">${x}</span>`,
              ),
            }}
          ></div>
        ) : (
          <div className="nodata-message">There are no forecast discussions available for this airport</div>
        )}
      </div>
    </div>
  );
};

export default Afd;
