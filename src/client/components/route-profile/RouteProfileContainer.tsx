import { FormControlLabel, RadioGroup, Radio } from '@mui/material';
import { ChangeEvent } from 'react';
import { LayerControlState, RoutePointType } from '../../interfaces/layerControl';
import { UsePersonalMinsLayerItems } from '../map/common/AreoConstants';
import { InputFieldWrapper, RadioButton } from '../settings-drawer';
import { jsonClone } from '../utils/ObjectUtil';
import CheckBoxOutlineBlankOutlined from '@material-ui/icons/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import { RouteProfileChartType, RouteProfileIcingDataType, RouteProfileWindDataType } from '../../interfaces/route';

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
  temp: RouteProfileWindDataType;
  wind: RouteProfileWindDataType;
  course: RouteProfileWindDataType;
} = {
  temp: 'Temp',
  wind: 'Wind',
  course: 'Course',
};

const routeProfileIcingDataTypes: {
  prob: RouteProfileIcingDataType;
  sev: RouteProfileIcingDataType;
  sld: RouteProfileIcingDataType;
  sevsld: RouteProfileIcingDataType;
} = {
  prob: 'Prob',
  sev: 'Sev',
  sld: 'SLD',
  sevsld: 'Sev+SLD',
};

const RouteProfileContainer = () => {
  return (
    <div className="route-profile-container">
      <div className="route-profile-header">
        <RadioGroup className="select-chart-type" value={routeProfileChartTypes.wind}>
          {Object.entries(routeProfileChartTypes).map(([key, value]) => {
            return (
              <FormControlLabel
                key={key}
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
          <div className="select-data-type">
            <InputFieldWrapper>
              <div className="input_radio_container">
                {Object.entries(routeProfileWindDataTypes).map(([key, value]) => {
                  return (
                    <RadioButton
                      id={key}
                      value={value}
                      title={value}
                      selectedValue={routeProfileWindDataTypes.wind}
                      description=""
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        console.log(e.target.value as RouteProfileWindDataType);
                      }}
                    />
                  );
                })}
              </div>
            </InputFieldWrapper>
          </div>
          <div className="select-altitude">
            <InputFieldWrapper>
              <div className="input_radio_container">
                {Object.entries(routeProfileIcingDataTypes).map(([key, value]) => {
                  return (
                    <RadioButton
                      id={key}
                      value={value}
                      title={value}
                      selectedValue={routeProfileIcingDataTypes.sev}
                      description=""
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        console.log(e.target.value as RouteProfileIcingDataType);
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
  );
};

export default RouteProfileContainer;
