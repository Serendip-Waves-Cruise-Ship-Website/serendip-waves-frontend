import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CustomerDashboard from '../components/dashboards/CustomerDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';
import ChefDashboard from '../components/dashboards/ChefDashboard';
import StaffDashboard from '../components/dashboards/StaffDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const renderDashboard = () => {
    switch (user?.role?.toLowerCase()) {
      case 'customer':
        return <CustomerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'superadmin':
        return <SuperAdminDashboard />;
      case 'chef':
        return <ChefDashboard />;
      case 'staff':
        return <StaffDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container my-5">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
