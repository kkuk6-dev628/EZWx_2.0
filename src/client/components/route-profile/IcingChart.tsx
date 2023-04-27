import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AreaSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  getRouteLength,
  getSegmentsCount,
  getTimeGradientStops,
  getValueFromDataset,
  interpolateRoute,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import { useGetRouteProfileStateQuery } from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';

const IcingChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);

  return (
    <RouteProfileChart>
      <LineSeries
        data={[
          { x: 0, y: 5000 },
          { x: 200, y: 15000 },
        ]}
        color="yellow"
      ></LineSeries>
    </RouteProfileChart>
  );
};
export default IcingChart;
