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
import { SvgMap, SvgRoute, SvgAir, SvgRefresh } from '../utils/SvgIcons';
import { useRouter } from 'next/router';
import { selectAuth } from '../../store/auth/authSlice';
import toast from 'react-hot-toast';
import Route from '../shared/Route';
import { PaperComponent } from '../map/leaflet/Map';
import { selectDataLoadTime, setDataLoadTime } from '../../store/layers/DataLoadTimeSlice';
import { useDispatch } from 'react-redux';
import { FetchUserSettings } from '../shared/SettingsDrawer';
import CloudsChart from './CloudsChart';
import TurbChart from './TurbChart';
import WindChart from './WindChart';
import IcingChart from './IcingChart';

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

const routeProfileWindDataTypes: {
  windspeed: RouteProfileWindDataType;
  headtail: RouteProfileWindDataType;
} = {
  windspeed: 'Windspeed',
  headtail: 'Head/tailwind',
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
      id: 'airport',
      name: 'Airport',
      svg: <SvgAir />,
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
      <div className="route-profile">
        <FetchUserSettings />
        <Dialog
          PaperComponent={PaperComponent}
          hideBackdrop
          disableEnforceFocus
          style={{ position: 'absolute' }}
          open={showRouteEditor}
          onClose={() => setShowRouteEditor(false)}
          aria-labelledby="draggable-dialog-title"
        >
          <Route setIsShowModal={setShowRouteEditor} />
        </Dialog>
        <MapTabs tabMenus={tabMenus} />
        <div className="route-profile-container">
          <RouteProfileDataLoader key={dataLoadTime} />
          <div className="route-profile-header">
            <RadioGroup
              className="select-chart-type"
              value={routeProfileState.chartType ? routeProfileState.chartType : routeProfileChartTypes.wind}
              onChange={(_e, value) => {
                handleUpdateState({
                  ...routeProfileState,
                  chartType: value as unknown as RouteProfileChartType,
                });
              }}
            >
              {Object.entries(routeProfileChartTypes).map(([key, value]) => {
                return (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={
                      <Radio
                        color="primary"
                        icon={<CheckBoxOutlineBlankOutlined />}
                        checkedIcon={<CheckBoxOutlinedIcon />}
                      />
                    }
                    label={value}
                  />
                );
              })}
            </RadioGroup>
            <div className="header-right">
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
                <InputFieldWrapper>
                  <div className="input_radio_container">
                    {routeProfileMaxAltitudes.map((value) => {
                      return (
                        <RadioButton
                          id={value}
                          key={value}
                          value={value}
                          title={value}
                          selectedValue={routeProfileState.maxAltitude}
                          description=""
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            handleUpdateState({
                              ...routeProfileState,
                              maxAltitude: parseInt(e.target.value) as RouteProfileMaxAltitudes,
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </InputFieldWrapper>
              </div>
            </div>
          </div>
          <div className="route-profile-chart-container">
            <div className="scrollable-chart-content">
              {routeProfileApiState.chartType === 'Wind' && <WindChart />}
              {routeProfileApiState.chartType === 'Clouds' && <CloudsChart></CloudsChart>}
              {routeProfileApiState.chartType === 'Icing' && <IcingChart></IcingChart>}
              {routeProfileApiState.chartType === 'Turb' && <TurbChart></TurbChart>}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RouteProfileContainer;