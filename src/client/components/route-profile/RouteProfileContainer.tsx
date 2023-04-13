import { FormControlLabel, RadioGroup, Radio, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { InputFieldWrapper, RadioButton } from '../settings-drawer';
import CheckBoxOutlineBlankOutlined from '@material-ui/icons/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import { XYPlot, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, AreaSeries, Highlight } from 'react-vis';
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
import { useQueryElevationApiMutation, useQueryOpenMeteoMutation } from '../../store/route-profile/elevationApi';
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import RouteProfileDataLoader, {
  getRouteLength,
  getSegmentsCount,
  interpolateRoute,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { selectRouteElevationPoints, selectRouteSegments } from '../../store/route-profile/RouteProfile';
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
  mtw: 'MTW',
};

const routeProfileMaxAltitudes: RouteProfileMaxAltitudes[] = [500, 250, 150];

const RouteProfileContainer = () => {
  const { data: routeProfileApiState, isLoading } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [routeProfileState, setRouteProfileState] = useState<RouteProfileState>(routeProfileApiState);
  const [updateRouteProfileState] = useUpdateRouteProfileStateMutation();
  const [queryElevations, queryElevationsResult] = useQueryElevationApiMutation();
  const [elevationSeries, setElevationSeries] = useState([]);
  const activeRoute = useSelector(selectActiveRoute);
  const [routeLength, setRouteLength] = useState(0);
  const userSettings = useSelector(selectSettings);
  const [segmentsCount, setSegmentsCount] = useState(1);
  const startMargin = segmentsCount ? routeLength / segmentsCount / 2 : 0;
  const [lastDrawLocation, setLastDrawLocation] = useState<any>();

  useEffect(() => {
    if (activeRoute) {
      // userSettings.default_distance_unit == true then km, or nm
      setRouteLength(getRouteLength(activeRoute, !userSettings.default_distance_unit));
      const elevationPoints = interpolateRoute(activeRoute, totalNumberOfElevations);
      queryElevations({ queryPoints: elevationPoints });
      setSegmentsCount(getSegmentsCount(activeRoute));
    }
  }, [activeRoute, userSettings.default_distance_unit]);

  useEffect(() => {
    if (queryElevationsResult.isSuccess && queryElevationsResult.data && routeLength) {
      const elevations = [];
      const elevationApiResults = queryElevationsResult.data.results;
      const elSegmentLength = routeLength / totalNumberOfElevations;
      for (let i = 0; i < elevationApiResults.length; i++) {
        elevations.push({ x: i * elSegmentLength, y: elevationApiResults[i].elevation });
      }
      setElevationSeries(elevations);
    }
  }, [queryElevationsResult.isSuccess, routeLength]);

  useEffect(() => {
    setRouteProfileState({ ...routeProfileApiState });
  }, [routeProfileApiState]);

  const handleUpdateState = (state: RouteProfileState) => {
    setRouteProfileState(state);
    updateRouteProfileState(state);
  };

  return (
    !isLoading && (
      <div className="route-profile-container">
        <RouteProfileDataLoader />
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
                  onChange={(_, value) => {
                    handleUpdateState({ ...routeProfileState, icingLayers: value });
                  }}
                  aria-label="Icing Data Layers"
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
                  aria-label="Icing Data Layers"
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
          <XYPlot
            height={600}
            width={1600}
            yDomain={[0, routeProfileState.maxAltitude * 100]}
            xDomain={[-startMargin, routeLength]}
          >
            <AreaSeries
              data={[
                { x: -startMargin, y: 50000 },
                { x: routeLength, y: 50000 },
              ]}
              color="skyblue"
            />
            <VerticalGridLines
              tickValues={Array.from({ length: segmentsCount * 2 + 1 }, (value, index) =>
                Math.round((index * routeLength) / (segmentsCount * 2)),
              )}
              style={{
                stroke: '#22222222',
              }}
            />
            <HorizontalGridLines
              style={{
                stroke: '#22222222',
              }}
            />
            <XAxis
              tickValues={Array.from({ length: segmentsCount + 1 }, (value, index) =>
                Math.round((index * routeLength) / segmentsCount),
              )}
              tickFormat={(v) => v}
              style={{
                line: { stroke: '#ADDDE100' },
                ticks: { stroke: '#ADDDE100' },
                text: { stroke: 'none', fill: 'white', fontWeight: 600 },
              }}
            />
            <YAxis
              tickValues={[0, 10000, 20000, 30000, 40000, 50000]}
              tickFormat={(v) => v / 100}
              style={{
                line: { stroke: '#ADDDE100' },
                ticks: { stroke: '#ADDDE100' },
                text: { stroke: 'none', fill: 'white', fontWeight: 600 },
              }}
            />
            <AreaSeries data={elevationSeries} color="#9e8f85" curve={'curveMonotoneX'} />
          </XYPlot>
        </div>
      </div>
    )
  );
};

export default RouteProfileContainer;
