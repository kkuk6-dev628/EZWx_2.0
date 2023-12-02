import { CircularProgress, Dialog, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import MapTabs from '../components/shared/MapTabs';
import { SvgBackward, SvgBookmark, SvgForward, SvgRefresh, SvgRoute } from '../components/utils/SvgIcons';
import { AutoCompleteInput } from '../components/common';
import Meteogram from '../components/airportwx/Meteogram';
import {
  airportwxApi,
  initialAirportWxState,
  useAddRecentAirportMutation,
  useGetAirportwxStateQuery,
  useGetAllAirportsQuery,
  useGetRecentAirportQuery,
  useUpdateAirportwxStateMutation,
  useUpdateRecentAirportMutation,
} from '../store/airportwx/airportwxApi';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectCurrentAirport, setCurrentAirport, setCurrentAirportPos } from '../store/airportwx/airportwx';
import { selectSettings } from '../store/user/UserSettings';
import { PaperComponent } from '../components/common/PaperComponent';
import dynamic from 'next/dynamic';
import { selectDataLoadTime, setDataLoadTime } from '../store/layers/DataLoadTimeSlice';
import { selectActiveRoute, setActiveRoute } from '../store/route/routes';
import { RoutePoint } from '../interfaces/route';
import Metar from '../components/airportwx/Metar';
import Taf from '../components/airportwx/Taf';
import Afd from '../components/airportwx/Afd';
import { useGetRoutesQuery } from '../store/route/routeApi';
const Route = dynamic(() => import('../components/shared/Route'), {
  ssr: false,
});

function AirportWxPage() {
  const { data: recentAirports, isSuccess: isSuccessRecentAirports } = useGetRecentAirportQuery(null);
  const dataLoadedTime = useSelector(selectDataLoadTime);
  const currentAirport = useSelector(selectCurrentAirport);
  const settingsState = useSelector(selectSettings);
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();
  const [addRecentAirport] = useAddRecentAirportMutation();
  const [updateRecentAirport] = useUpdateRecentAirportMutation();
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const { data: airportwxDbState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [airportwxState, setAirportwxState] = useState(initialAirportWxState);
  const [updateAirportwxState] = useUpdateAirportwxStateMutation();
  const { data: airports } = useGetAllAirportsQuery('');
  const [validAirport, setValidAirport] = useState(currentAirport);

  useEffect(() => {
    if (currentAirport) {
      setValidAirport(currentAirport);
    }
  }, [currentAirport]);

  useEffect(() => {
    if (airportwxDbState) {
      setAirportwxState({ ...airportwxDbState });
    }
  }, [airportwxDbState]);

  useEffect(() => {
    if (recentAirports && recentAirports.length > 0) {
      dispatch(setCurrentAirport(recentAirports[0].airportId));
    } else {
      dispatch(setCurrentAirport(settingsState.default_home_airport));
    }
  }, [recentAirports]);

  useEffect(() => {
    if (currentAirport && airports && airports.length > 0) {
      const airport = airports.filter((curr) => {
        return curr.key === currentAirport;
      });
      if (airport.length > 0) {
        dispatch(
          setCurrentAirportPos({
            lat: airport[0].position.coordinates[1],
            lng: airport[0].position.coordinates[0],
          }),
        );
      }
    }
  }, [airports, currentAirport]);

  function changeCurrentAirport(airport) {
    dispatch(setCurrentAirport(airport.key || airport));
    const airportId = airport.key || airport;
    const exist = recentAirports.find((x) => x.airportId === airportId);
    if (exist) {
      updateRecentAirport(exist);
    } else {
      addRecentAirport({ airportId: airport.key || airport });
    }
  }

  function handler(id: string) {
    switch (id) {
      case 'route':
        setShowRouteEditor(true);
        break;
      case 'next':
      case 'previous':
        let airports = [];
        if (activeRoute) {
          airports = [
            activeRoute.departure.key,
            ...activeRoute.routeOfFlight
              .filter((x) => x.routePoint.type === 'icaoid' || x.routePoint.type === 'faaid')
              .map((x) => x.routePoint.key),
            activeRoute.destination.key,
          ];
        } else {
          airports = recentAirports.slice(0, 10).map((x) => x.airportId);
        }
        if (id === 'previous') {
          airports = airports.reverse();
        }
        for (let i = 0; i < airports.length; i++) {
          const airport = airports[i];
          if (airport === currentAirport) {
            let j = i + 1;
            if (i === airports.length - 1) {
              j = 0;
            }
            if (airports[j] !== currentAirport) {
              dispatch(setCurrentAirport(airports[j]));
              return;
            }
          }
        }
        dispatch(setCurrentAirport(airports[0]));
        break;
      case 'save':
        break;
      case 'refresh':
        dispatch(setDataLoadTime(Date.now()));
        dispatch(
          airportwxApi.util.invalidateTags([
            { type: 'meteogramData', id: 'LIST' },
            { type: 'metar', id: 'LIST' },
            { type: 'taf', id: 'LIST' },
            { type: 'afd', id: 'LIST' },
          ]),
        );
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
        {airports ? (
          <div className="main-container">
            <div className="primary-bar">
              <FormControl className="select-view">
                <Select value={airportwxDbState.viewType} onChange={changeViews}>
                  <MenuItem value={'meteogram'}>Meteogram</MenuItem>
                  <MenuItem value={'metar'}>METARs</MenuItem>
                  <MenuItem value={'tafs'}>TAFs</MenuItem>
                  <MenuItem value={'afd'}>Discussion</MenuItem>
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
                    if (recentAirports && recentAirports.length > 0) {
                      dispatch(setCurrentAirport(recentAirports[0].airportId));
                    } else if (settingsState.default_home_airport) {
                      dispatch(setCurrentAirport(settingsState.default_home_airport));
                    }
                  }}
                  exceptions={[]}
                  key={'home-airport'}
                />
              </div>
            </div>
            <div className="view-container">
              {airportwxDbState.viewType === 'meteogram' && <Meteogram />}
              {airportwxDbState.viewType === 'metar' && <Metar />}
              {airportwxDbState.viewType === 'tafs' && <Taf />}
              {airportwxDbState.viewType === 'afd' && <Afd />}
              {airportwxDbState.viewType === 'skew-t' && (
                <iframe
                  key={dataLoadedTime}
                  sandbox="allow-scripts allow-same-origin"
                  src={`/api/airportwx/${validAirport}/GSD/?data_source=Op40&latest=latest&layout=off&n_hrs=20.0&airport=${validAirport}`}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="data-loading">
            <CircularProgress color="secondary" />
          </div>
        )}
      </div>
    )
  );
}

export default AirportWxPage;
