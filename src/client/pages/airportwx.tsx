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
import { selectCurrentAirport, setCurrentAirport } from '../store/airportwx/airportwx';
import { selectSettings } from '../store/user/UserSettings';
import { PaperComponent } from '../components/common/PaperComponent';
import dynamic from 'next/dynamic';
import { selectDataLoadTime, setDataLoadTime } from '../store/layers/DataLoadTimeSlice';
import { selectActiveRoute, setActiveRoute } from '../store/route/routes';
import { RoutePoint } from '../interfaces/route';
import Metar from '../components/airportwx/Metar';
import Taf from '../components/airportwx/Taf';
import Afd from '../components/airportwx/Afd';
import { SaveDialog } from '../components/saved/SaveDialog';
import { useGetSavedItemsQuery } from '../store/saved/savedApi';
import { isSameJson } from '../utils/utils';
import { Icon } from '@iconify/react';
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
  const [tempAirport, setTempAirport] = useState(currentAirport);
  const [showSaveDlg, setShowSaveDlg] = useState(false);
  const { data: savedData } = useGetSavedItemsQuery();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentAirport && savedData) {
      const saved = savedData.find((x) => isSameJson(x.data.data, currentAirport));
      setIsSaved(saved ? true : false);
    }
  }, [savedData, currentAirport]);

  useEffect(() => {
    if (tempAirport) {
      dispatch(setCurrentAirport(tempAirport));
    }
  }, [tempAirport]);

  useEffect(() => {
    if (currentAirport) {
      setTempAirport(currentAirport);
    }
  }, [currentAirport]);

  useEffect(() => {
    if (airportwxDbState) {
      setAirportwxState({ ...airportwxDbState });
    }
  }, [airportwxDbState]);

  useEffect(() => {
    if (currentAirport) {
      return;
    }
    if (recentAirports && recentAirports.length > 0) {
      dispatch(setCurrentAirport(recentAirports[0].airport));
      setTempAirport(recentAirports[0].airport);
    } else {
      if (airports) {
        const homeAirport = airports.find((x) => x.key === settingsState.default_home_airport);
        dispatch(setCurrentAirport(homeAirport));
        addRecentAirport({ airportId: homeAirport.key, airport: homeAirport });
      }
    }
  }, [recentAirports, airports]);

  function addAirport2Recent(airport) {
    const airportId = airport.key;
    if (recentAirports) {
      const exist = recentAirports.find((x) => x.airportId === airportId);
      if (exist) {
        updateRecentAirport(exist);
      } else {
        addRecentAirport({ airportId: airport.key, airport });
      }
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
            activeRoute.departure,
            ...activeRoute.routeOfFlight
              .filter((x) => x.routePoint.type === 'icaoid' || x.routePoint.type === 'faaid')
              .map((x) => x.routePoint),
            activeRoute.destination,
          ];
        } else {
          airports = recentAirports.slice(0, 10).map((x) => x.airport);
        }
        if (id === 'previous') {
          airports = airports.reverse();
        }
        for (let i = 0; i < airports.length; i++) {
          const airport = airports[i];
          if (airport.key === currentAirport.key) {
            let j = i + 1;
            if (i === airports.length - 1) {
              j = 0;
            }
            if (airports[j].key !== currentAirport.key) {
              setTempAirport(airports[j]);
              return;
            }
          }
        }
        setTempAirport(airports[0]);
        break;
      case 'save':
        setShowSaveDlg(true);
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
      svg: isSaved ? (
        <Icon icon="bi:bookmark-plus-fill" color="var(--color-primary)" width={24} />
      ) : (
        <Icon icon="bi:bookmark-plus" color="var(--color-primary)" width={24} />
      ),
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
        </Dialog>
        {currentAirport && (
          <SaveDialog
            title="Save airport"
            open={showSaveDlg}
            name={`${currentAirport.key} - ${currentAirport.name}`}
            onClose={() => setShowSaveDlg(false)}
            data={{ type: 'airport', data: currentAirport }}
          />
        )}
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
                  selectedValue={tempAirport as any}
                  handleAutoComplete={(name, value) => {
                    setTempAirport(value);
                    if (value) addAirport2Recent(value);
                  }}
                  onBlur={() => {
                    setTempAirport(currentAirport);
                  }}
                  exceptions={[]}
                  key={'home-airport'}
                />
              </div>
            </div>
            {currentAirport && currentAirport.position && (
              <div className="view-container">
                {airportwxDbState.viewType === 'meteogram' && <Meteogram />}
                {airportwxDbState.viewType === 'metar' && <Metar />}
                {airportwxDbState.viewType === 'tafs' && <Taf />}
                {airportwxDbState.viewType === 'afd' && <Afd />}
                {airportwxDbState.viewType === 'skew-t' && currentAirport && (
                  <iframe
                    key={dataLoadedTime}
                    sandbox="allow-scripts allow-same-origin"
                    src={`/api/airportwx/${currentAirport.key}/GSD/?data_source=Op40&latest=latest&layout=off&n_hrs=20.0&airport=${currentAirport.key}`}
                  />
                )}
              </div>
            )}
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
