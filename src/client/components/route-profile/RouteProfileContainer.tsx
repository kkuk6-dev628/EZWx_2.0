import { FormControlLabel, RadioGroup, Radio, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { InputFieldWrapper, RadioButton } from '../settings-drawer';
import CheckBoxOutlineBlankOutlined from '@material-ui/icons/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
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
import RouteProfileDataWrapper from './RouteProfileDataWrapper';
import { useQueryElevationsMutation } from '../../store/route-profile/elevationApi';
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import { interpolateRoute } from './RouteProfileDataLoader';

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
  const [queryElevations, queryElevationsResult] = useQueryElevationsMutation();
  const activeRoute = useSelector(selectActiveRoute);

  useEffect(() => {
    if (activeRoute) {
      const routeVertices = interpolateRoute(activeRoute);
      queryElevations({ queryPoints: routeVertices });
    }
  }, [activeRoute]);

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
        <RouteProfileDataWrapper />
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
      </div>
    )
  );
};

export default RouteProfileContainer;
