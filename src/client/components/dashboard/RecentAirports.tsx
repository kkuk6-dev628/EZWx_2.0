import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { useAddRecentAirportMutation, useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';
import { ICON_INDENT } from '../../utils/constants';
import { useRouter } from 'next/router';

function RecentAirports() {
  const { data: recentAirports } = useGetRecentAirportQuery(null);
  const [addRecentAirport] = useAddRecentAirportMutation();
  const { data: savedData } = useGetSavedItemsQuery();
  const [savedAirports, setSavedAirports] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (recentAirports && savedData) {
      const saved = recentAirports.filter((r) =>
        savedData.find((d) => d.data.type === 'airport' && d.data.data.key === r.airportId),
      );
      setSavedAirports(saved);
    }
  }, [savedData, recentAirports]);

  function airportClick(airport) {
    addRecentAirport(airport);
    router.push('/airportwx');
  }

  return (
    <div className="dashboard-card">
      <div className="card-title">Recent Airports</div>
      <div className="card-body">
        {recentAirports &&
          recentAirports.map((airport, index) => {
            const isSaved = savedAirports.includes(airport);
            return (
              <div className="card-item" key={`recent-airport-${index}`} onClick={() => airportClick(airport)}>
                {isSaved && <SvgSaveFilled />}
                <p style={!isSaved ? { paddingInlineStart: ICON_INDENT } : null}>
                  {airport.airport.key} ({airport.airport.name})
                </p>
              </div>
            );
          })}
      </div>
      <div className="card-footer">
        <button className="dashboard-btn" value="Modify" onClick={() => router.push('/airportwx')}>
          Airports
        </button>
      </div>
    </div>
  );
}
export default RecentAirports;
