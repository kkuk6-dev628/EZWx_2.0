import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { initialRouteProfileState } from '../../store/route-profile/routeProfileApi';
import {
  chartLabels,
  routeProfileChartTypeLabels,
  routeProfileChartTypes,
  routeProfileIcingDataTypes,
  routeProfileTurbDataTypes,
  routeProfileWindDataTypes,
} from '../../utils/constants';
import { InputFieldWrapper, RadioButton } from '../settings-drawer';
import { FetchUserSettings } from '../shared/FetchUserSettings';
import { ChangeEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteProfileWindDataType, RouteProfileIcingDataType } from '../../interfaces/route-profile';
import { selectSettings } from '../../store/user/UserSettings';
import { selectCurrentAirport, selectViewHeight, selectViewWidth } from '../../store/airportwx/airportwx';
import {
  airportwxApi,
  initialAirportWxState,
  useGetAirportwxStateQuery,
  useGetMeteogramDataQuery,
  useUpdateAirportwxStateMutation,
} from '../../store/airportwx/airportwxApi';
import { useDispatch } from 'react-redux';
import MWindChart from './MWindChart';
import { AirportWxState } from '../../interfaces/airportwx';
import MTurbChart from './MTurbChart';
import MIcingChart from './MIcingChart';
import MCloudsChart from './MCloudsChart';
import { Position2Latlng, isTouchScreenDevice } from '../../utils/utils';

function Meteogram() {
  const userSettings = useSelector(selectSettings);
  const currentAirport = useSelector(selectCurrentAirport);
  useGetMeteogramDataQuery(Position2Latlng(currentAirport.position.coordinates), {
    skip: currentAirport === null || !currentAirport.position,
  });
  const { data: airportwxDbState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const [airportwxState, setAirportwxState] = useState(initialAirportWxState);
  const [updateAirportwxState] = useUpdateAirportwxStateMutation();
  const dispatch = useDispatch();
  const isTouchScreen = isTouchScreenDevice();
  useEffect(() => {
    if (airportwxDbState) {
      setAirportwxState({ ...airportwxDbState });
    }
  }, [airportwxDbState]);

  function handleUpdateState(state: AirportWxState) {
    setAirportwxState(state);
    updateAirportwxState(state);
  }

  return (
    isAirportwxStateLoaded && (
      <div className="route-profile">
        <FetchUserSettings />
        <div className={'route-profile-container' + (isTouchScreen ? ' touch' : '')}>
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
                        selectedValue={airportwxState.chartType}
                        description=""
                        onChange={() => {
                          handleUpdateState({ ...airportwxState, chartType: value });
                        }}
                      />
                    );
                  })}
                </div>
              </InputFieldWrapper>
            </div>

            <div className="header-right">
              {airportwxState.chartType !== routeProfileChartTypes.turb && (
                <div className="show-temperature">
                  <div className="MuiToggleButtonGroup-root">
                    <ToggleButton
                      value="showTemperature"
                      aria-label="showTemperature"
                      selected={airportwxState.showTemperature}
                      style={{ padding: 2 }}
                      onChange={() => {
                        handleUpdateState({
                          ...airportwxState,
                          showTemperature: !airportwxState.showTemperature,
                        });
                      }}
                    >
                      <i className="fas">{userSettings.default_temperature_unit ? '\u00B0F' : '\u00B0C'}</i>
                      <i className="fas fa-thermometer-half fa-2x" aria-hidden="true"></i>
                    </ToggleButton>
                  </div>
                </div>
              )}
              {airportwxState.chartType === routeProfileChartTypes.icing && (
                <div className="select-data-type">
                  <ToggleButtonGroup
                    value={airportwxState.icingLayers}
                    aria-label="Icing Data Layers"
                    onChange={(_, values: RouteProfileIcingDataType[]) => {
                      const newValues = values.filter((item) => !airportwxState.icingLayers.includes(item));
                      if (newValues.length > 0) {
                        if (newValues.includes(routeProfileIcingDataTypes.prob)) {
                          handleUpdateState({ ...airportwxState, icingLayers: [routeProfileIcingDataTypes.prob] });
                        } else {
                          handleUpdateState({
                            ...airportwxState,
                            icingLayers: values.filter((item) => item !== routeProfileIcingDataTypes.prob),
                          });
                        }
                      } else {
                        handleUpdateState({ ...airportwxState, icingLayers: values });
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
              {airportwxState.chartType === routeProfileChartTypes.turb && (
                <div className="select-data-type">
                  <ToggleButtonGroup
                    value={airportwxState.turbLayers}
                    onChange={(_, value) => {
                      handleUpdateState({ ...airportwxState, turbLayers: value });
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
                    const newValue = airportwxState.maxAltitude === 500 ? 300 : 200;
                    handleUpdateState({
                      ...airportwxState,
                      maxAltitude: newValue,
                    });
                  }}
                >
                  &darr;
                </button>
                <div className="label-altitude">{airportwxState.maxAltitude}</div>
                <button
                  className="btn-altitude right"
                  onClick={() => {
                    const newValue = airportwxState.maxAltitude === 200 ? 300 : 500;
                    handleUpdateState({
                      ...airportwxState,
                      maxAltitude: newValue,
                    });
                  }}
                >
                  &uarr;
                </button>
              </div>
            </div>
          </div>
          <div className="label-chart">
            {airportwxState.chartType && (
              <div className="fixed-label left">
                {chartLabels[airportwxState.maxAltitude].map((label) => (
                  <div key={'left-' + label}>{label}</div>
                ))}
              </div>
            )}
            <div className={'route-profile-chart-container'}>
              {airportwxState.chartType === 'Wind' && <MWindChart />}
              {airportwxState.chartType === 'Turb' && <MTurbChart />}
              {airportwxState.chartType === 'Icing' && <MIcingChart />}
              {airportwxState.chartType === 'Clouds' && <MCloudsChart />}
            </div>

            <div className="fixed-label right">
              {chartLabels[airportwxState.maxAltitude].map((label) => (
                <div key={'right-' + label}>{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default Meteogram;
