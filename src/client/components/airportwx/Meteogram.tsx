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
import {
  selectCurrentAirport,
  selectCurrentAirportPos,
  selectViewHeight,
  selectViewWidth,
  setCurrentAirportPos,
  setViewHeight,
  setViewWidth,
} from '../../store/airportwx/airportwx';
import { useGetAirportQuery } from '../../store/route/airportApi';
import {
  initialAirportWxState,
  useGetAirportwxStateQuery,
  useGetMeteogramDataQuery,
  useUpdateAirportwxStateMutation,
} from '../../store/airportwx/airportwxApi';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import MWindChart from './MWindChart';
import { AirportWxState } from '../../interfaces/airportwx';
import MTurbChart from './MTurbChart';
import MIcingChart from './MIcingChart';
import MCloudsChart from './MCloudsChart';
import { getXAxisValues } from './MeteogramChart';
import { calcChartWidth } from '../../utils/utils';

function Meteogram() {
  const userSettings = useSelector(selectSettings);
  const interval = 1;
  const currentAirport = useSelector(selectCurrentAirport);
  const { isSuccess, data: airports } = useGetAirportQuery('');
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const { isSuccess: isLoadedMGramData, data: meteogramData } = useGetMeteogramDataQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const { data: airportwxDbState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const [airportwxState, setAirportwxState] = useState(initialAirportWxState);
  const [updateAirportwxState] = useUpdateAirportwxStateMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (airportwxDbState) {
      setAirportwxState({ ...airportwxDbState });
    }
  }, [isAirportwxStateLoaded]);

  useEffect(() => {
    if (isSuccess && airports.length > 0) {
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
  }, [isSuccess, currentAirport]);

  function handleUpdateState(state: AirportWxState) {
    setAirportwxState(state);
    updateAirportwxState(state);
  }

  return (
    isAirportwxStateLoaded && (
      <div className="route-profile">
        <FetchUserSettings />
        <div className="route-profile-container">
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
            <div className="route-profile-chart-container">
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
          <div className="days">
            <div className="select-chart-width-days">
              <InputFieldWrapper>
                <div className="input_radio_container">
                  <RadioButton
                    id="1-day"
                    key="1-day"
                    value={1}
                    title="1-Day"
                    selectedValue={airportwxState.chartDays}
                    description=""
                    onChange={() => {
                      handleUpdateState({ ...airportwxState, chartDays: 1 });
                    }}
                  />
                  <RadioButton
                    id="3-day"
                    key="3-day"
                    value={3}
                    title="3-Day"
                    selectedValue={airportwxState.chartDays}
                    description=""
                    onChange={() => {
                      handleUpdateState({ ...airportwxState, chartDays: 3 });
                    }}
                  />
                </div>
              </InputFieldWrapper>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default Meteogram;
