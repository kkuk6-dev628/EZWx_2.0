import { useEffect, useState } from 'react';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { isSameRoutes } from '../map/common/AreoFunctions';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { Route } from '../../interfaces/route';
import { ICON_INDENT } from '../../utils/constants';

function RecentRoutes() {
  const { data: recentRoutes } = useGetRoutesQuery(null);
  const { data: savedData } = useGetSavedItemsQuery();
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (recentRoutes && savedData) {
      const saved = recentRoutes.filter((r) =>
        savedData.find((d) => d.data.type === 'route' && isSameRoutes(d.data.data, r)),
      );
      setSavedRoutes(saved);
    }
  }, [savedData, recentRoutes]);

  function routeClick(route: Route) {
    setSelectedRoute(route);
    setShowRouteEditor(true);
  }

  return (
    <div className="dashboard-card">
      <div className="card-title">Recent Routes</div>
      <div className="card-body">
        {recentRoutes &&
          recentRoutes.map((route, index) => {
            const isSaved = savedRoutes.includes(route);
            return (
              <div className="card-item" key={`recent-route-${index}`} onClick={() => routeClick(route)}>
                {isSaved && <SvgSaveFilled />}
                <p style={!isSaved ? { paddingInlineStart: ICON_INDENT } : null}>
                  {route.departure.key} to {route.destination.key}
                </p>
              </div>
            );
          })}
      </div>
      <div className="card-footer">
        <button className="dashboard-btn" value="Modify">
          Plan a route
        </button>
      </div>
    </div>
  );
}
export default RecentRoutes;
