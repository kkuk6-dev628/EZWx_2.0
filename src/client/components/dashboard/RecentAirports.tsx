import { useEffect, useState } from 'react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { useAddRecentAirportMutation, useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';
import { ICON_INDENT } from '../../utils/constants';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { selectViewHeight, selectViewWidth, setCurrentAirport } from '../../store/airportwx/airportwx';
import { Icon } from '@iconify/react';

function RecentAirports() {
  const { data: recentAirports } = useGetRecentAirportQuery(null, { refetchOnMountOrArgChange: true });
  const [addRecentAirport] = useAddRecentAirportMutation();
  const { data: savedData } = useGetSavedItemsQuery(null, { refetchOnMountOrArgChange: true });
  const [savedAirports, setSavedAirports] = useState([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;

  useEffect(() => {
    if (recentAirports && savedData) {
      const saved = recentAirports.filter((r) =>
        savedData.find((d) => d.data.type === 'airport' && d.data.data.key === r.airportId),
      );
      setSavedAirports(saved);
    }
  }, [savedData, recentAirports]);

  function airportClick(airport) {
    dispatch(setCurrentAirport(airport.airport));
    addRecentAirport(airport);
    router.push('/airportwx');
  }

  return (
    <>
      <div className={'dashboard-card' + (expanded ? ' expanded' : '')}>
        <div className="card-title">
          <p>Recent Airports</p>
          {showExpandBtn && (
            <span className="btn-expand" onClick={() => setExpanded((expanded) => !expanded)}>
              {expanded ? (
                <Icon icon="fluent:contract-down-left-28-regular" color="var(--color-primary)" />
              ) : (
                <Icon icon="fluent:contract-up-right-28-regular" color="var(--color-primary)" />
              )}
            </span>
          )}
        </div>
        <div className="card-body">
          {recentAirports && recentAirports.length ? (
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
            })
          ) : (
            <div className="card-item">
              <p>None</p>
            </div>
          )}
        </div>
        <div className="card-footer">
          <button className="dashboard-btn" value="Modify" onClick={() => router.push('/airportwx')}>
            Airports
          </button>
        </div>
      </div>
      {expanded && <div className="dashboard-card"></div>}
    </>
  );
}
export default RecentAirports;
