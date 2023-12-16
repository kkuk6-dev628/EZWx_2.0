import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import { icingSevLegend } from '../airportwx/MIcingChart';
import { convectivePotential, icingIntensity } from '../../utils/constants';

function PersonalMins() {
  const settings = useSelector(selectSettings);

  return settings ? (
    <div className="dashboard-card w2x">
      <div className="card-title">Personal Mins</div>
      <div className="card-body">
        <div className="row">
          <div className="col">
            <div className="card-item">
              <p>
                <b>Departure CIG:</b> <span className="color-red">{settings.ceiling_at_departure[0]}</span>-
                <span className="color-green">{settings.ceiling_at_departure[1]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Departure VIS:</b> <span className="color-red">{settings.surface_visibility_at_departure[0]}</span>-
                <span className="color-green">{settings.surface_visibility_at_departure[1]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Departure Xwind:</b>{' '}
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
          </div>
          <div className="col">
            <div className="card-item">
              <p>
                <b>Icing severity:</b>{' '}
                <span className="color-green">{icingIntensity[settings.en_route_icing_intensity[0]]}</span>-
                <span className="color-red">{icingIntensity[settings.en_route_icing_intensity[1]]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Turb severity:</b> <span className="color-green">{settings.en_route_turbulence_intensity[0]}</span>-
                <span className="color-red">{settings.en_route_turbulence_intensity[1]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Conv potential:</b>{' '}
                <span className="color-green">{convectivePotential[settings.en_route_convective_potential[0]]}</span>-
                <span className="color-red">{convectivePotential[settings.en_route_convective_potential[1]]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Destination CIG:</b> <span className="color-red">{settings.ceiling_at_destination[0]}</span>-
                <span className="color-green">{settings.ceiling_at_destination[1]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Destination VIS:</b>{' '}
                <span className="color-red">{settings.surface_visibility_at_destination[0]}</span>-
                <span className="color-green">{settings.surface_visibility_at_destination[1]}</span>
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Destination Xwind:</b>{' '}
                <span className="color-green">{settings.crosswinds_at_destination_airport[0]}</span>-
                <span className="color-red">{settings.crosswinds_at_destination_airport[1]}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <button className="dashboard-btn" value="Modify">
          Modify
        </button>
      </div>
    </div>
  ) : (
    <></>
  );
}
export default PersonalMins;
