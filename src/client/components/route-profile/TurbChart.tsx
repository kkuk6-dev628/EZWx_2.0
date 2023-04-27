import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
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
import {
  useGetRouteProfileStateQuery,
  useQueryCaturbDataMutation,
  useQueryMwturbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';

const TurbChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);
  const [, queryCaturbDataResult] = useQueryCaturbDataMutation({ fixedCacheKey: cacheKeys.caturb });
  const [, queryMwturbDataResult] = useQueryMwturbDataMutation({ fixedCacheKey: cacheKeys.mwturb });

  return (
    <RouteProfileChart>
      <VerticalRectSeries
        colorType="literal"
        data={[
          { x: 100, y: 5000, x0: 50, y0: 6000, color: 'red', opacity: 0.3 },
          { x: 300, y: 15000, x0: 250, y0: 16000, color: 'yellow' },
        ]}
      ></VerticalRectSeries>
    </RouteProfileChart>
  );
};
export default TurbChart;
