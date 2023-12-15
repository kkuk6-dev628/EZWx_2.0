import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';

function RecentAirports() {
  const { data: recentAirports } = useGetRecentAirportQuery(null);
  const { data: savedData } = useGetSavedItemsQuery();
  const [savedAirports, setSavedAirports] = useState([]);

  useEffect(() => {
    if (recentAirports && savedData) {
      const saved = recentAirports.filter((r) =>
        savedData.find((d) => d.data.type === 'airport' && d.data.data.key === r.airportId),
      );
      setSavedAirports(saved);
    }
  }, [savedData, recentAirports]);

  function routeClick(airport) {
    console.log(airport);
  }

  return (
    <div className="dashboard-card">
      <div className="card-title">Recent Airports</div>
      <div className="card-body">
        {recentAirports &&
          recentAirports.map((route, index) => {
            const isSaved = savedAirports.includes(route);
            return (
              <div className="card-item" key={`recent-airport-${index}`} onClick={() => routeClick(route)}>
                {isSaved && <SvgSaveFilled />}
                <p style={!isSaved ? { paddingInlineStart: 24 } : null}>
                  {route.airport.key} to {route.airport.name}
                </p>
              </div>
            );
          })}
      </div>
      <div className="card-footer">
        <button className="dashboard-btn" value="Modify">
          Airports
        </button>
      </div>
    </div>
  );
}
export default RecentAirports;
