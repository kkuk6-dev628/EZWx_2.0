/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { isSameRoutes } from '../map/common/AreoFunctions';
import { SvgSaveFilled } from '../utils/SvgIcons';
import { Route } from '../../interfaces/route';
import { ICON_INDENT } from '../../utils/constants';
import { PaperComponent } from '../common/PaperComponent';
import { Dialog } from '@mui/material';
import dynamic from 'next/dynamic';
import { emptyRouteData } from '../../utils/constants';
// @ts-ignore
const RouteEditor = dynamic(() => import('../shared/Route'), {
  ssr: false,
});

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

  function planRouteClick() {
    setSelectedRoute(emptyRouteData);
    setShowRouteEditor(true);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
        <button className="dashboard-btn" value="Modify" onClick={planRouteClick}>
          Plan a route
        </button>
      </div>
      {showRouteEditor && (
        <Dialog
          PaperComponent={PaperComponent}
          hideBackdrop
          disableEnforceFocus
          style={{ position: 'absolute' }}
          open={showRouteEditor}
          onClose={() => setShowRouteEditor(false)}
        >
          {/* @ts-ignore */}
          <RouteEditor setIsShowModal={setShowRouteEditor} route={selectedRoute} />
        </Dialog>
      )}
    </div>
  );
}
export default RecentRoutes;
