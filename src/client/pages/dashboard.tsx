import DashboardSettings from '../components/dashboard/DashboardSettings';
import PersonalMins from '../components/dashboard/PersonalMins';
import RecentAirports from '../components/dashboard/RecentAirports';
import RecentImagery from '../components/dashboard/RecentImagery';
import RecentRoutes from '../components/dashboard/RecentRoutes';
import SavedDashboard from '../components/dashboard/SavedDashboard';
import { FetchUserSettings } from '../components/shared/FetchUserSettings';

function Dashboard() {
  return (
    <div className="dashboard-root">
      <div className="dashboard-row">
        <SavedDashboard />
        <RecentRoutes />
        <RecentAirports />
        <RecentImagery />
        <FetchUserSettings />
        <DashboardSettings />
        <PersonalMins />
      </div>
    </div>
  );
}

export default Dashboard;
