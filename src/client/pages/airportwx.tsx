import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import MapTabs from '../components/shared/MapTabs';
import { SvgBackward, SvgBookmark, SvgForward, SvgRefresh, SvgRoute } from '../components/utils/SvgIcons';
import { AutoCompleteInput } from '../components/common';
import Meteogram from '../components/airportwx/Meteogram';
import { useGetRecentAirportQuery } from '../store/airportwx/airportwxApi';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setCurrentAirport } from '../store/airportwx/airportwx';
import { selectSettings } from '../store/user/UserSettings';

function AirportWxPage() {
  const { data: recentAirports, isSuccess: isSuccessRecentAirports } = useGetRecentAirportQuery(null);
  const settingsState = useSelector(selectSettings);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSuccessRecentAirports && recentAirports.length > 0) {
      dispatch(setCurrentAirport(recentAirports[0].airportId));
    } else {
      dispatch(setCurrentAirport(settingsState.default_home_airport));
    }
  }, [isSuccessRecentAirports]);

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
            <Select value={'meteogram'} onChange={changeViews}>
              <MenuItem value={'meteogram'}>Meteogram</MenuItem>
              <MenuItem value={'metars'}>METARs</MenuItem>
              <MenuItem value={'terminal-forecasts'}>Terminal Forecasts</MenuItem>
              <MenuItem value={'forecast-discussion'}>Forecast Discussion</MenuItem>
              <MenuItem value={'skew-t'}>Skew-T</MenuItem>
            </Select>
          </FormControl>
          <div className="select-airport">
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
        <div className="view-container">
          <Meteogram />
        </div>
      </div>
    </div>
  );
}

export default AirportWxPage;
