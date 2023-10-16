import { FormControlLabel, RadioGroup, Radio, ToggleButton, ToggleButtonGroup, Dialog } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { InputFieldWrapper, RadioButton } from '../settings-drawer';
import CheckBoxOutlineBlankOutlined from '@material-ui/icons/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import 'react-vis/dist/style.css';
import {
  RouteProfileChartType,
  RouteProfileIcingDataType,
  RouteProfileMaxAltitudes,
  RouteProfileState,
  RouteProfileTurbDataType,
  RouteProfileWindDataType,
} from '../../interfaces/route-profile';
import {
  useGetRouteProfileStateQuery,
  useUpdateRouteProfileStateMutation,
} from '../../store/route-profile/routeProfileApi';
import { useSelector } from 'react-redux';
import RouteProfileDataLoader from './RouteProfileDataLoader';
import MapTabs from '../shared/MapTabs';
import { SvgBaseMap, SvgRoute, SvgAir, SvgRefresh, SvgMap, SvgBookmark } from '../utils/SvgIcons';
import { useRouter } from 'next/router';
import { selectAuth } from '../../store/auth/authSlice';
import toast from 'react-hot-toast';
import Route from '../shared/Route';
import { PaperComponent } from '../map/leaflet/Map';
import { selectDataLoadTime, setDataLoadTime } from '../../store/layers/DataLoadTimeSlice';
import { useDispatch } from 'react-redux';
import CloudsChart from './CloudsChart';
import TurbChart from './TurbChart';
import WindChart from './WindChart';
import IcingChart from './IcingChart';
import DepartureAdvisor, { FetchUserSettings } from '../shared/DepartureAdvisor';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import { selectActiveRoute } from '../../store/route/routes';
import { selectSettings } from '../../store/user/UserSettings';

const routeProfileChartTypes: {
  wind: RouteProfileChartType;
  clouds: RouteProfileChartType;
  icing: RouteProfileChartType;
  turb: RouteProfileChartType;
} = {
  wind: 'Wind',
  clouds: 'Clouds',
  icing: 'Icing',
  turb: 'Turb',
};
const routeProfileChartTypeLabels: {
  wind: string;
  clouds: string;
  icing: string;
  turb: string;
} = {
  wind: 'WIND',
  clouds: 'CLDS',
  icing: 'ICE',
  turb: 'TURB',
};

const routeProfileWindDataTypes: {
  windspeed: RouteProfileWindDataType;
  headtail: RouteProfileWindDataType;
} = {
  windspeed: 'SPEED',
  headtail: 'HEAD/TAIL',
};

const routeProfileIcingDataTypes: {
  prob: RouteProfileIcingDataType;
  sev: RouteProfileIcingDataType;
  sld: RouteProfileIcingDataType;
} = {
  prob: 'Prob',
  sev: 'Sev',
  sld: 'SLD',
};

const routeProfileTurbDataTypes: {
  cat: RouteProfileTurbDataType;
  mtw: RouteProfileTurbDataType;
} = {
  cat: 'CAT',
  mtw: 'MWT',
};

const routeProfileMaxAltitudes: RouteProfileMaxAltitudes[] = [500, 300, 200];
const chartLabels = {
  200: [200, 160, 120, 80, 40, 0],
  300: [300, 240, 180, 120, 60, 0],
  500: [500, 400, 300, 200, 100, 0],
};

const RouteProfileContainer = () => {
  const { data: routeProfileApiState, isSuccess: isRouteProfileStateLoaded } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const dataLoadTime = useSelector(selectDataLoadTime);
  const [routeProfileState, setRouteProfileState] = useState<RouteProfileState>(routeProfileApiState);
  const [updateRouteProfileState] = useUpdateRouteProfileStateMutation();
  const router = useRouter();
  const auth = useSelector(selectAuth);
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const segments = useSelector(selectRouteSegments);
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);

  const dispatch = useDispatch();

  useEffect(() => {
    setRouteProfileState({ ...routeProfileApiState });
  }, [routeProfileApiState]);

  const handleUpdateState = (state: RouteProfileState) => {
    setRouteProfileState(state);
    updateRouteProfileState(state);
  };
  const handler = (id: string) => {
    switch (id) {
      case 'map':
        router.push('/map');
        break;
      case 'route':
        if (auth.id) {
          setShowRouteEditor(true);
        } else {
          toast.error('Please sign in to create route!');
        }
        break;
      case 'airport':
        break;
      case 'refresh':
        dispatch(setDataLoadTime(Date.now()));
        break;
      default:
        break;
    }
  };
  const tabMenus = [
    {
      id: 'map',
      name: 'Map',
      svg: <SvgMap />,
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
      id: 'save',
      name: 'Save',
      svg: <SvgBookmark />,
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

  return (
    isRouteProfileStateLoaded && (
      <>
        <div className="route-profile">
          <FetchUserSettings />
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
          <MapTabs tabMenus={tabMenus} />
          <div className="route-profile-container">
            <RouteProfileDataLoader key={dataLoadTime} />
            <div className="route-profile-header">
              <div className="header-left">
                <InputFieldWrapper>
                  <div className="input_radio_container">
                    {Object.entries(routeProfileChartTypes).map(([key, value]) => {
                      return (
                        <RadioButton
                          id={key}
                          key={value}
                          value={value}
                          title={routeProfileChartTypeLabels[key]}
                          selectedValue={
                            routeProfileState.chartType ? routeProfileState.chartType : routeProfileChartTypes.wind
                          }
                          description=""
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            handleUpdateState({
                              ...routeProfileState,
                              chartType: value as unknown as RouteProfileChartType,
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </InputFieldWrapper>
              </div>

              <div className="header-right">
                {routeProfileState.chartType !== routeProfileChartTypes.turb && (
                  <div className="show-temperature">
                    <div className="MuiToggleButtonGroup-root">
                      <ToggleButton
                        value="showTemperature"
                        aria-label="showTemperature"
                        selected={routeProfileState.showTemperature}
                        style={{ padding: 2 }}
                        onChange={() => {
                          handleUpdateState({
                            ...routeProfileState,
                            showTemperature: !routeProfileState.showTemperature,
                          });
                        }}
                      >
                        <i className="fas">{userSettings.default_temperature_unit ? '\u00B0F' : '\u00B0C'}</i>
                        <i className="fas fa-thermometer-half fa-2x" aria-hidden="true"></i>
                      </ToggleButton>
                    </div>
                  </div>
                )}
                {routeProfileState.chartType === routeProfileChartTypes.wind && (
                  <div className="select-data-type">
                    <InputFieldWrapper>
                      <div className="input_radio_container">
                        {Object.entries(routeProfileWindDataTypes).map(([key, value]) => {
                          return (
                            <RadioButton
                              id={key}
                              key={value}
                              value={value}
                              title={value}
                              selectedValue={routeProfileState.windLayer}
                              description=""
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                handleUpdateState({
                                  ...routeProfileApiState,
                                  windLayer: e.target.value as unknown as RouteProfileWindDataType,
                                });
                              }}
                            />
                          );
                        })}
                      </div>
                    </InputFieldWrapper>
                  </div>
                )}
                {routeProfileState.chartType === routeProfileChartTypes.icing && (
                  <div className="select-data-type">
                    <ToggleButtonGroup
                      value={routeProfileState.icingLayers}
                      aria-label="Icing Data Layers"
                      onChange={(_, values: RouteProfileIcingDataType[]) => {
                        const newValues = values.filter((item) => !routeProfileState.icingLayers.includes(item));
                        if (newValues.length > 0) {
                          if (newValues.includes(routeProfileIcingDataTypes.prob)) {
                            handleUpdateState({ ...routeProfileState, icingLayers: [routeProfileIcingDataTypes.prob] });
                          } else {
                            handleUpdateState({
                              ...routeProfileState,
                              icingLayers: values.filter((item) => item !== routeProfileIcingDataTypes.prob),
                            });
                          }
                        } else {
                          handleUpdateState({ ...routeProfileState, icingLayers: values });
                        }
                      }}
                    >
                      {Object.entries(routeProfileIcingDataTypes).map(([key, value]) => {
                        return (
                          <ToggleButton key={value} value={value} aria-label={value}>
                            {value}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </div>
                )}
                {routeProfileState.chartType === routeProfileChartTypes.turb && (
                  <div className="select-data-type">
                    <ToggleButtonGroup
                      value={routeProfileState.turbLayers}
                      onChange={(_, value) => {
                        handleUpdateState({ ...routeProfileState, turbLayers: value });
                      }}
                      aria-label="Turbulence Data Layers"
                    >
                      {Object.entries(routeProfileTurbDataTypes).map(([key, value]) => {
                        return (
                          <ToggleButton key={value} value={value} aria-label={value}>
                            {value}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </div>
                )}
                <div className="select-altitude">
                  <button
                    className="btn-altitude left"
                    onClick={() => {
                      const newValue = routeProfileState.maxAltitude === 500 ? 300 : 200;
                      handleUpdateState({
                        ...routeProfileState,
                        maxAltitude: newValue,
                      });
                    }}
                  >
                    -
                  </button>
                  <div className="label-altitude">{routeProfileState.maxAltitude}</div>
                  <button
                    className="btn-altitude right"
                    onClick={() => {
                      const newValue = routeProfileState.maxAltitude === 200 ? 300 : 500;
                      handleUpdateState({
                        ...routeProfileState,
                        maxAltitude: newValue,
                      });
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="label-chart">
              {routeProfileState.chartType && (
                <div className="fixed-label left">
                  {chartLabels[routeProfileApiState.maxAltitude].map((label) => (
                    <div key={'left-' + label}>{label}</div>
                  ))}
                </div>
              )}
              <div className="route-profile-chart-container">
                {routeProfileState.chartType === 'Wind' && <WindChart />}
                {routeProfileState.chartType === 'Clouds' && <CloudsChart></CloudsChart>}
                {routeProfileState.chartType === 'Icing' && <IcingChart></IcingChart>}
                {routeProfileState.chartType === 'Turb' && <TurbChart></TurbChart>}
              </div>
              {segments.length && (
                <div className="fixed-label right">
                  {chartLabels[routeProfileApiState.maxAltitude].map((label) => (
                    <div key={'right-' + label}>{label}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <div className="departure-advisor-background"></div> */}
        <DepartureAdvisor showPast={false} />
      </>
    )
  );
};

export default RouteProfileContainer;
