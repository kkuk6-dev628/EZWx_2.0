/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import L from 'leaflet';
import { Route } from '../../interfaces/route';
import { useEffect } from 'react';
import 'leaflet-arc';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { selectAuth } from '../../store/auth/authSlice';
import {
  useQueryCaturbDataMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryHumidityDataMutation,
  useQueryMwturbDataMutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { CircularProgress } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';

export const totalNumberOfElevations = 512;

const getLineLength = (coordinateList: GeoJSON.Position[], inMile = false): number => {
  let routeLength = 0;
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      routeLength += a.distanceTo(b);
    }
    return b;
  });
  return inMile ? routeLength / 1852 : routeLength / 1000;
};

export const getRouteLength = (route: Route, inMile = false): number => {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, inMile);
  return routeLengthNm;
};

export const interpolateRoute = (route: Route, divideNumber, returnAsLeaflet = false): L.LatLng[] => {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const totalLength = getLineLength(coordinateList);
  const interpolatedLatlngs = new Array<L.LatLng>();
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.map((latlng, index) => {
    if (index < latlngs.length - 1) {
      const nextLatlng = latlngs[index + 1];
      const segmentLength = latlng.distanceTo(nextLatlng);
      const vertices = Math.round((segmentLength * divideNumber) / (totalLength * 1000));
      //@ts-ignore
      const polyline = L.Polyline.Arc(latlng, nextLatlng, { color: '#f0fa', weight: 6, pane: 'route-line', vertices });
      //@ts-ignore
      interpolatedLatlngs.push(...polyline.getLatLngs());
    }
  });
  return returnAsLeaflet ? interpolatedLatlngs : L.GeoJSON.latLngsToCoords(interpolatedLatlngs);
};

export const getSegmentsCount = (route: Route): number => {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, true);
  if (routeLengthNm <= 250) {
    return 7;
  } else if (routeLengthNm <= 500) {
    return 9;
  } else if (routeLengthNm <= 800) {
    return 11;
  } else {
    return 13;
  }
};

const RouteProfileDataLoader = () => {
  const auth = useSelector(selectAuth);
  const [queryCaturbData, queryCaturbDataResult] = useQueryCaturbDataMutation();
  const [queryMwturbData, queryMwturbDataResult] = useQueryMwturbDataMutation();
  const [queryHumidityData, queryhumidityDataResult] = useQueryHumidityDataMutation();
  const [queryTemperatureData, queryTemperatureDataResult] = useQueryTemperatureDataMutation();
  const [queryGfsWindDirectionData, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation();
  const [queryGfsWindSpeedData, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation();
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();

  if (auth.id) {
    useGetRoutesQuery('');
  }

  useEffect(() => {
    if (activeRoute) {
      const routeVertices = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      queryCaturbData({ queryPoints: routeVertices });
      queryMwturbData({ queryPoints: routeVertices });
      queryHumidityData({ queryPoints: routeVertices });
      queryTemperatureData({ queryPoints: routeVertices });
      queryGfsWindDirectionData({ queryPoints: routeVertices });
      queryGfsWindSpeedData({ queryPoints: routeVertices });
    }
  }, [activeRoute]);

  useEffect(() => {
    if (queryCaturbDataResult.data) {
      // console.log(queryDataResult.data);
    }
  }, [queryCaturbDataResult.isSuccess]);

  return (
    <>
      {queryCaturbDataResult.isLoading && (
        <div className="data-loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </>
  );
};

export default RouteProfileDataLoader;
