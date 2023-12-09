import { useSelector } from 'react-redux';
import { selectCurrentAirport } from '../../store/airportwx/airportwx';
import { useGetAfdTextQuery } from '../../store/airportwx/airportwxApi';
import { Position2Latlng } from '../../utils/utils';

const Afd = () => {
  const currentAirport = useSelector(selectCurrentAirport);
  const { data: afdText } = useGetAfdTextQuery(Position2Latlng(currentAirport.position.coordinates), {
    refetchOnMountOrArgChange: true,
    skip: currentAirport === null || !currentAirport.position,
  });

  return (
    <div className="metar-container">
      <div className="metar-scroll-content">
        <div className="airport-name">
          AFD - {currentAirport.name} ({currentAirport.key})
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
