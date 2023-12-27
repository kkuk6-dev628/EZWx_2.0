import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import { useDispatch } from 'react-redux';
import { setShowGeneralSettings, setShowPersonalMins, setShowSettingsView } from '../../store/header/header';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { selectViewHeight, selectViewWidth } from '../../store/airportwx/airportwx';
import { landingPages } from '../../utils/constants';
import { PrimaryButton, SecondaryButton } from '../common';
import { DraggableDlg } from '../common/DraggableDlg';
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from '../../store/user/userSettingsApi';
import { selectAuth } from '../../store/auth/authSlice';

function DashboardSettings() {
  const { id } = useSelector(selectAuth);
  const { data: settings } = useGetUserSettingsQuery(id, { skip: id === '', refetchOnMountOrArgChange: true });
  const dispatch = useDispatch();
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;
  const [expanded, setExpanded] = useState(false);
  const showTwoColumns = viewW > 1070;
  const [showLandingPageDlg, setShowLandingPageDlg] = useState(false);
  const [updateUserSettings] = useUpdateUserSettingsMutation();

  useEffect(() => {
    if (settings) {
      if (!settings.landing_page) {
        setShowLandingPageDlg(true);
        updateUserSettings({ ...settings, landing_page: 'dashboard' });
      }
    }
  }, [settings]);

  return settings ? (
    <>
      <div className={'dashboard-card w2x' + (expanded ? ' expanded' : '')}>
        <div className="card-title">
          <p>Settings</p>
          {showExpandBtn && (
            <span className="btn-expand" onClick={() => setExpanded((expanded) => !expanded)}>
              {expanded ? (
                <Icon icon="fluent:contract-down-left-28-regular" color="var(--color-primary)" />
              ) : (
                <Icon icon="fluent:contract-up-right-28-regular" color="var(--color-primary)" />
              )}
            </span>
          )}
        </div>
        <div className="card-body">
          {showTwoColumns ? (
            <div className="row">
              <div className="col">
                <div className="card-item">
                  <p>
                    <b>Home airport:</b> {settings.default_home_airport}
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Landing page:</b>{' '}
                    {settings.landing_page ? landingPages[settings.landing_page].name : landingPages.dashboard.name}
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Temperature:</b> {!settings.default_temperature_unit ? 'Celsius' : 'Fahrenheit'}
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Time:</b> {!settings.default_time_display_unit ? 'Zulu' : 'Local'}
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Wind Speed:</b> {!settings.default_wind_speed_unit ? 'Knots' : 'MPH'}
                  </p>
                </div>
              </div>
              <div className="col">
                <div className="card-item">
                  <p>
                    <b>Distance:</b> {!settings.default_distance_unit ? 'Nautical miles' : 'Kilometers'}
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Visibility:</b> {!settings.default_visibility_unit ? 'Statute miles' : 'Meters'}
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>True airspeed:</b> {settings.true_airspeed} kts
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Aircraft class:</b>{' '}
                    {settings.max_takeoff_weight_category.slice(0, 1).toUpperCase() +
                      settings.max_takeoff_weight_category.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="card-item">
                <p>
                  <b>Home airport:</b> {settings.default_home_airport}
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Temperature:</b> {!settings.default_temperature_unit ? 'Celsius' : 'Fahrenheit'}
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Time:</b> {!settings.default_time_display_unit ? 'Zulu' : 'Local'}
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Wind Speed:</b> {!settings.default_wind_speed_unit ? 'Knots' : 'MPH'}
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Distance:</b> {!settings.default_distance_unit ? 'Nautical miles' : 'Kilometers'}
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Visibility:</b> {!settings.default_visibility_unit ? 'Statute miles' : 'Meters'}
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>True airspeed:</b> {settings.true_airspeed} kts
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Aircraft class:</b>{' '}
                  {settings.max_takeoff_weight_category.slice(0, 1).toUpperCase() +
                    settings.max_takeoff_weight_category.slice(1)}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="card-footer">
          <button
            className="dashboard-btn"
            value="Modify"
            onClick={() => {
              dispatch(setShowSettingsView(true));
              dispatch(setShowGeneralSettings(true));
              dispatch(setShowPersonalMins(false));
            }}
          >
            Modify
          </button>
        </div>
      </div>
      {expanded && <div className="dashboard-card"></div>}
      <DraggableDlg
        open={showLandingPageDlg}
        onClose={() => setShowLandingPageDlg(false)}
        title="Choose your initial landing page"
        body={
          'Would you like the Dashboard to be your primary landing page when you sign in? You can always choose other options later in the Settings.'
        }
        footer={
          <>
            <SecondaryButton
              onClick={() => setShowLandingPageDlg(false)}
              text="Decide later"
              isLoading={false}
            ></SecondaryButton>
            <PrimaryButton onClick={() => setShowLandingPageDlg(false)} text="Accept" isLoading={false}></PrimaryButton>
          </>
        }
      />
    </>
  ) : (
    <></>
  );
}
export default DashboardSettings;
