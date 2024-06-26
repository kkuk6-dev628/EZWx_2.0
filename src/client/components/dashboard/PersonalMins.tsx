import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import { convectivePotential, icingIntensity } from '../../utils/constants';
import { setShowGeneralSettings, setShowPersonalMins, setShowSettingsView } from '../../store/header/header';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { selectViewWidth, selectViewHeight } from '../../store/airportwx/airportwx';

function PersonalMins() {
  const settings = useSelector(selectSettings);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);
  const showExpandBtn = viewW < 480 || viewH < 480;
  const showTwoColumns = viewW > 1070;

  return settings ? (
    <>
      <div className={'dashboard-card w2x' + (expanded ? ' expanded' : '')}>
        <div className="card-title">
          <p>Personal Mins</p>
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
                    <b>Depart CIG:</b> <span className="color-red">{settings.ceiling_at_departure[0]}</span>-
                    <span className="color-green">{settings.ceiling_at_departure[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Depart VIS:</b> <span className="color-red">{settings.surface_visibility_at_departure[0]}</span>-
                    <span className="color-green">{settings.surface_visibility_at_departure[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Depart Xwind:</b>{' '}
                    <span className="color-green">{settings.crosswinds_at_departure_airport[0]}</span>-
                    <span className="color-red">{settings.crosswinds_at_departure_airport[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>En route CIG:</b> <span className="color-red">{settings.ceiling_along_route[0]}</span>-
                    <span className="color-green">{settings.ceiling_along_route[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>En route VIS:</b> <span className="color-red">{settings.surface_visibility_along_route[0]}</span>
                    -<span className="color-green">{settings.surface_visibility_along_route[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Icing prob:</b> <span className="color-green">{settings.en_route_icing_probability[0]}</span>-
                    <span className="color-red">{settings.en_route_icing_probability[1]}</span>
                  </p>
                </div>
              </div>
              <div className="col">
                <div className="card-item">
                  <p>
                    <b>Icing sev:</b>{' '}
                    <span className="color-green">{icingIntensity[settings.en_route_icing_intensity[0]]}</span>-
                    <span className="color-red">{icingIntensity[settings.en_route_icing_intensity[1]]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Turb severity:</b>{' '}
                    <span className="color-green">{settings.en_route_turbulence_intensity[0]}</span>-
                    <span className="color-red">{settings.en_route_turbulence_intensity[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Conv pot:</b>{' '}
                    <span className="color-green">
                      {convectivePotential[settings.en_route_convective_potential[0]]}
                    </span>
                    -<span className="color-red">{convectivePotential[settings.en_route_convective_potential[1]]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Dest CIG:</b> <span className="color-red">{settings.ceiling_at_destination[0]}</span>-
                    <span className="color-green">{settings.ceiling_at_destination[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Dest VIS:</b> <span className="color-red">{settings.surface_visibility_at_destination[0]}</span>-
                    <span className="color-green">{settings.surface_visibility_at_destination[1]}</span>
                  </p>
                </div>
                <div className="card-item">
                  <p>
                    <b>Dest Xwind:</b>{' '}
                    <span className="color-green">{settings.crosswinds_at_destination_airport[0]}</span>-
                    <span className="color-red">{settings.crosswinds_at_destination_airport[1]}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="card-item">
                <p>
                  <b>Depart CIG:</b> <span className="color-red">{settings.ceiling_at_departure[0]}</span>-
                  <span className="color-green">{settings.ceiling_at_departure[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Depart VIS:</b> <span className="color-red">{settings.surface_visibility_at_departure[0]}</span>-
                  <span className="color-green">{settings.surface_visibility_at_departure[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Depart Xwind:</b>{' '}
                  <span className="color-green">{settings.crosswinds_at_departure_airport[0]}</span>-
                  <span className="color-red">{settings.crosswinds_at_departure_airport[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>En route CIG:</b> <span className="color-red">{settings.ceiling_along_route[0]}</span>-
                  <span className="color-green">{settings.ceiling_along_route[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>En route VIS:</b> <span className="color-red">{settings.surface_visibility_along_route[0]}</span>-
                  <span className="color-green">{settings.surface_visibility_along_route[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Icing prob:</b> <span className="color-green">{settings.en_route_icing_probability[0]}</span>-
                  <span className="color-red">{settings.en_route_icing_probability[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Icing sev:</b>{' '}
                  <span className="color-green">{icingIntensity[settings.en_route_icing_intensity[0]]}</span>-
                  <span className="color-red">{icingIntensity[settings.en_route_icing_intensity[1]]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Turb severity:</b> <span className="color-green">{settings.en_route_turbulence_intensity[0]}</span>
                  -<span className="color-red">{settings.en_route_turbulence_intensity[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Conv pot:</b>{' '}
                  <span className="color-green">{convectivePotential[settings.en_route_convective_potential[0]]}</span>-
                  <span className="color-red">{convectivePotential[settings.en_route_convective_potential[1]]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Dest CIG:</b> <span className="color-red">{settings.ceiling_at_destination[0]}</span>-
                  <span className="color-green">{settings.ceiling_at_destination[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Dest VIS:</b> <span className="color-red">{settings.surface_visibility_at_destination[0]}</span>-
                  <span className="color-green">{settings.surface_visibility_at_destination[1]}</span>
                </p>
              </div>
              <div className="card-item">
                <p>
                  <b>Desti Xwind:</b>{' '}
                  <span className="color-green">{settings.crosswinds_at_destination_airport[0]}</span>-
                  <span className="color-red">{settings.crosswinds_at_destination_airport[1]}</span>
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
              dispatch(setShowPersonalMins(true));
              dispatch(setShowGeneralSettings(false));
            }}
          >
            Modify
          </button>
        </div>
      </div>
      {expanded && <div className="dashboard-card"></div>}
    </>
  ) : (
    <></>
  );
}
export default PersonalMins;
