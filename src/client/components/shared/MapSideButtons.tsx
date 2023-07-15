import { DomEvent } from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '../../store/auth/authSlice';
import { setDataLoadTime } from '../../store/layers/DataLoadTimeSlice';
import { useGetLayerControlStateQuery, useGetBaseLayerControlStateQuery } from '../../store/layers/layerControlApi';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { useGetUserSettingsQuery } from '../../store/user/userSettingsApi';
import { SvgRefresh } from '../utils/SvgIcons';
import { useMap } from 'react-leaflet';
import { defaultBounds } from '../map/leaflet/Map';

const MapSideButtons = () => {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const ref = useRef();
  useEffect(() => {
    if (ref?.current) {
      DomEvent.disableClickPropagation(ref.current);
      DomEvent.disableScrollPropagation(ref.current);
      // L.DomEvent.on(ref.current, 'mousemove contextmenu drag', L.DomEvent.stop);
    }
  }, [ref?.current]);

  let refetchAllSettings;
  if (auth.id) {
    const { refetch: refetchLayerControl } = useGetLayerControlStateQuery('');
    const { refetch: refetchRoutes } = useGetRoutesQuery(null);
    const { refetch: refetchBaseLayerControl } = useGetBaseLayerControlStateQuery('');
    const { refetch: refetchUserSettings } = useGetUserSettingsQuery(auth.id);
    refetchAllSettings = () => {
      refetchLayerControl();
      refetchRoutes();
      refetchBaseLayerControl();
      refetchUserSettings();
    };
  }

  const map = useMap();
  function goToHomeView() {
    map.fitBounds(defaultBounds as any);
  }

  return (
    <div className="pos_relative" ref={ref}>
      <div className="map__btns__container">
        <div
          className="user__action__btns"
          onClick={() => {
            if (refetchAllSettings) refetchAllSettings();
            dispatch(setDataLoadTime(Date.now()));
          }}
        >
          <SvgRefresh />
        </div>
        <div
          className="user__action__btns"
          onClick={() => {
            goToHomeView();
          }}
        >
          <i className="far fa-home fa-sm"></i>
        </div>
      </div>
    </div>
  );
};

export default MapSideButtons;
