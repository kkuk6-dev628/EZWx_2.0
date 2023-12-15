import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';

function DashboardSettings() {
  const settings = useSelector(selectSettings);

  return settings ? (
    <div className="dashboard-card w2x">
      <div className="card-title">Settings</div>
      <div className="card-body">
        <div className="row">
          <div className="col">
            <div className="card-item">
              <p>
                <b>Home airport:</b> {settings.default_home_airport}
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Temperature:</b> {!settings.default_temperature_unit ? 'Celsius' : 'Facinate'}
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Time:</b> {!settings.default_time_display_unit ? 'Zulu' : 'Local'}
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Wind Speed:</b> {!settings.default_wind_speed_unit ? 'Knots' : 'Meters'}
              </p>
            </div>
          </div>
          <div className="col">
            <div className="card-item">
              <p>
                <b>Distance:</b> {!settings.default_distance_unit ? 'Nautical miles' : 'Meters'}
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Visibility:</b> {!settings.default_visibility_unit ? 'Statute miles' : 'Meters'}
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>True airspeed:</b> {settings.true_airspeed}knots
              </p>
            </div>
            <div className="card-item">
              <p>
                <b>Aircraft class:</b> {settings.max_takeoff_weight_category}
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
export default DashboardSettings;
