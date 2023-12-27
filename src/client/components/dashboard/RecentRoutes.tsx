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
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { selectViewWidth, selectViewHeight } from '../../store/airportwx/airportwx';
const RouteEditor = dynamic(() => import('../shared/Route'), {
  ssr: false,
});

function RecentRoutes() {
  const { data: recentRoutes } = useGetRoutesQuery(null, { refetchOnMountOrArgChange: true });
  const { data: savedData } = useGetSavedItemsQuery(null, { refetchOnMountOrArgChange: true });
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;

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

  return (
    <>
      <div className={'dashboard-card' + (expanded ? ' expanded' : '')}>
        <div className="card-title">
          <p>Recent Routes</p>
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
          {recentRoutes && recentRoutes.length ? (
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
            })
          ) : (
            <div className="card-item">
              <p>None</p>
            </div>
          )}
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
            <RouteEditor setIsShowModal={setShowRouteEditor} route={selectedRoute} />
          </Dialog>
        )}
      </div>
      {expanded && <div className="dashboard-card"></div>}
    </>
  );
}
export default RecentRoutes;
