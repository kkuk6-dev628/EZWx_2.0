/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import L from 'leaflet';
import { Route } from '../../interfaces/route';
import { useEffect } from 'react';
import 'leaflet-arc';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { selectAuth } from '../../store/auth/authSlice';
import { useQueryRouteProfileDataMutation } from '../../store/route-profile/routeProfileApi';
import { CircularProgress } from '@mui/material';
import { useQueryElevationsMutation } from '../../store/route-profile/elevationApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';
import { setRouteSegments } from '../../store/route-profile/RouteProfile';

const totalDivideNumber = 90;

const getRouteLengthInMeter = (coordinateList: GeoJSON.Position[]): number => {
  let routeLength = 0;
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      routeLength += a.distanceTo(b);
    }
    return b;
  });
  return routeLength;
};

export const interpolateRoute = (route: Route, returnAsLeaflet = false): L.LatLng[] => {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const totalLength = getRouteLengthInMeter(coordinateList);
  const interpolatedLatlngs = new Array<L.LatLng>();
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      const segmentLength = a.distanceTo(b);
      const vertices = Math.round((segmentLength * totalDivideNumber) / totalLength);
      //@ts-ignore
      const polyline = L.Polyline.Arc(a, b, { color: '#f0fa', weight: 6, pane: 'route-line', vertices });
      //@ts-ignore
      interpolatedLatlngs.push(...polyline.getLatLngs());
    }
    return b;
  });
  return returnAsLeaflet ? interpolatedLatlngs : L.GeoJSON.latLngsToCoords(interpolatedLatlngs);
};

const RouteProfileDataLoader = () => {
  const auth = useSelector(selectAuth);
  const [queryRouteProfileData, queryDataResult] = useQueryRouteProfileDataMutation();
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();

  if (auth.id) {
    useGetRoutesQuery('');
  }

  useEffect(() => {
    if (activeRoute) {
      const routeVertices = interpolateRoute(activeRoute);
      dispatch(setRouteSegments(routeVertices));
      // queryRouteProfileData({ queryPoints: routeVertices });
    }
  }, [activeRoute]);

  useEffect(() => {
    if (queryDataResult.data) {
      // console.log(queryDataResult.data);
    }
  }, [queryDataResult.isSuccess]);

  return (
    <>
      {queryDataResult.isLoading && (
        <div className="data-loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </>
  );
};

export default RouteProfileDataLoader;
