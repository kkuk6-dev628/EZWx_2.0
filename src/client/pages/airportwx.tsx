import { Dialog, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import MapTabs from '../components/shared/MapTabs';
import { SvgBackward, SvgBookmark, SvgForward, SvgRefresh, SvgRoute } from '../components/utils/SvgIcons';
import { AutoCompleteInput } from '../components/common';
import Meteogram from '../components/airportwx/Meteogram';
import {
  initialAirportWxState,
  useAddRecentAirportMutation,
  useGetAirportwxStateQuery,
  useGetRecentAirportQuery,
  useUpdateAirportwxStateMutation,
} from '../store/airportwx/airportwxApi';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectCurrentAirport, setCurrentAirport } from '../store/airportwx/airportwx';
import { selectSettings } from '../store/user/UserSettings';
import { PaperComponent } from '../components/common/PaperComponent';
import dynamic from 'next/dynamic';
import { setDataLoadTime } from '../store/layers/DataLoadTimeSlice';
import { selectActiveRoute } from '../store/route/routes';
import { RoutePoint } from '../interfaces/route';
import Metar from '../components/airportwx/Metar';
const Route = dynamic(() => import('../components/shared/Route'), {
  ssr: false,
});

function AirportWxPage() {
  const { data: recentAirports, isSuccess: isSuccessRecentAirports } = useGetRecentAirportQuery(null);
  const currentAirport = useSelector(selectCurrentAirport);
  const settingsState = useSelector(selectSettings);
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();
  const [addRecentAirport] = useAddRecentAirportMutation();
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const { data: airportwxDbState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [airportwxState, setAirportwxState] = useState(initialAirportWxState);
  const [updateAirportwxState] = useUpdateAirportwxStateMutation();

  useEffect(() => {
    if (airportwxDbState) {
      setAirportwxState({ ...airportwxDbState });
    }
  }, [airportwxDbState]);

  useEffect(() => {
    if (isSuccessRecentAirports && recentAirports.length > 0) {
      dispatch(setCurrentAirport(recentAirports[0].airportId));
    } else {
      dispatch(setCurrentAirport(settingsState.default_home_airport));
    }
  }, [isSuccessRecentAirports]);

  function changeCurrentAirport(airport) {
    dispatch(setCurrentAirport(airport.key || airport));
    addRecentAirport({ airportId: airport.key || airport });
  }
  function handler(id: string) {
    switch (id) {
      case 'route':
        setShowRouteEditor(true);
        break;
      case 'next':
      case 'previous':
        if (activeRoute) {
          let airports = [
            activeRoute.departure,
            ...activeRoute.routeOfFlight
              .filter((x) => x.routePoint.type === 'icaoid' || x.routePoint.type === 'faaid')
              .map((x) => x.routePoint),
            activeRoute.destination,
          ];
          if (id === 'previous') {
            airports = airports.reverse();
          }
          for (let i = 0; i < airports.length; i++) {
            const airport = airports[i];
            if (airport.key === currentAirport) {
              let j = i + 1;
              if (i === airports.length - 1) {
                j = 0;
              }
              changeCurrentAirport(airports[j]);
              return;
            }
          }
          changeCurrentAirport(airports[0]);
        }
        break;
      case 'save':
        break;
      case 'refresh':
        dispatch(setDataLoadTime(Date.now()));
        break;
    }
  }
  const tabMenus = [
    {
      id: 'save',
      name: 'Save',
      svg: <SvgBookmark />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'route',
      name: 'Route',
      svg: <SvgRoute />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'previous',
      name: 'Prev Airport',
      svg: <SvgBackward />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'next',
      name: 'Next Airport',
      svg: <SvgForward />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'refresh',
      name: 'Refresh',
      svg: <SvgRefresh />,
      handler: handler,
      isHideResponsive: false,
    },
  ];

  function changeViews(event: SelectChangeEvent) {
    updateAirportwxState({ ...airportwxDbState, viewType: event.target.value });
  }

  return (
    airportwxDbState && (
      <div className="airportwx-page">
        <Dialog
          PaperComponent={PaperComponent}
          hideBackdrop
          disableEnforceFocus
          style={{ position: 'absolute' }}
          open={showRouteEditor}
          onClose={() => setShowRouteEditor(false)}
        >
          <Route setIsShowModal={setShowRouteEditor} />
        </Dialog>{' '}
        <div className="tab-menus">
          <MapTabs tabMenus={tabMenus} />
        </div>
        <div className="main-container">
          <div className="primary-bar">
            <FormControl className="select-view">
              <Select value={airportwxDbState.viewType} onChange={changeViews}>
                <MenuItem value={'meteogram'}>Meteogram</MenuItem>
                <MenuItem value={'metar'}>METARs</MenuItem>
                <MenuItem value={'tafs'}>TAFs</MenuItem>
                <MenuItem value={'discussion'}>Discussion</MenuItem>
                <MenuItem value={'skew-t'}>Skew-T</MenuItem>
              </Select>
            </FormControl>
            <div className="select-airport">
              <AutoCompleteInput
                name="default_home_airport"
                selectedValue={currentAirport as any}
                handleAutoComplete={(name, value) => {
                  if (value) {
                    changeCurrentAirport(value);
                  } else {
                    dispatch(setCurrentAirport(null));
                  }
                }}
                onBlur={() => {
                  if (recentAirports && recentAirports.length > 0)
                    dispatch(setCurrentAirport(recentAirports[0].airportId));
                }}
                exceptions={[]}
                key={'home-airport'}
              />
            </div>
          </div>
          <div className="view-container">
            {airportwxDbState.viewType === 'meteogram' && <Meteogram />}
            {airportwxDbState.viewType === 'metar' && <Metar />}
          </div>
        </div>
      </div>
    )
  );
}

export default AirportWxPage;
