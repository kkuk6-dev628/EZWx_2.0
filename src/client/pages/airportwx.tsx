import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import MapTabs from '../components/shared/MapTabs';
import { SvgBackward, SvgBookmark, SvgForward, SvgRefresh, SvgRoute } from '../components/utils/SvgIcons';
import { AutoCompleteInput } from '../components/common';

function AirportWxPage() {
  function handler(id: string) {
    console.log(id);
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
      id: 'next',
      name: 'Next Airport',
      svg: <SvgForward />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'previous',
      name: 'Previous Airport',
      svg: <SvgBackward />,
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
    console.log(event.target.value);
  }

  return (
    <div className="airportwx-page">
      <div className="tab-menus">
        <MapTabs tabMenus={tabMenus} />
      </div>
      <div className="main-container">
        <div className="primary-bar">
          <FormControl className="select-view">
            <Select value={'meteogram'} label="Age" onChange={changeViews}>
              <MenuItem value={'meteogram'}>Meteogram</MenuItem>
              <MenuItem value={'metars'}>METARs</MenuItem>
              <MenuItem value={'terminal-forecasts'}>Terminal Forecasts</MenuItem>
              <MenuItem value={'forecast-discussion'}>Forecast Discussion</MenuItem>
              <MenuItem value={'skew-t'}>Skew-T</MenuItem>
            </Select>
          </FormControl>
          <AutoCompleteInput
            name="default_home_airport"
            selectedValue={null}
            handleAutoComplete={(name, value) => {
              console.log(value);
            }}
            exceptions={[]}
            key={'home-airport'}
          />
        </div>
      </div>
    </div>
  );
}

export default AirportWxPage;
