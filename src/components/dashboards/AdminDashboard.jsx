import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalBookings: 150,
    todayBookings: 12,
    revenue: 225000,
    customers: 450
  };

  const recentBookings = [
    { id: 1, customer: 'John Doe', cruise: 'Caribbean Paradise', date: '2025-06-15', amount: 1200, status: 'Confirmed' },
    { id: 2, customer: 'Jane Smith', cruise: 'Mediterranean Dream', date: '2025-07-20', amount: 1800, status: 'Pending' },
    { id: 3, customer: 'Bob Johnson', cruise: 'Alaska Adventure', date: '2025-08-10', amount: 2500, status: 'Confirmed' }
  ];

  return (
    <div className="admin-dashboard">
      <h1 className="mb-4 text-purple">Admin Dashboard - {user?.name}</h1>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{stats.totalBookings}</h3>
              <p className="mb-0">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{stats.todayBookings}</h3>
              <p className="mb-0">Today's Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">${stats.revenue.toLocaleString()}</h3>
              <p className="mb-0">Revenue (USD)</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{stats.customers}</h3>
              <p className="mb-0">Total Customers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-purple mb-4">
        <div className="card-body">
          <h5 className="card-title text-purple">Recent Bookings</h5>
          <table className="table table-purple">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Cruise</th>
                <th>Date</th>
                <th>Amount (USD)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td>{booking.cruise}</td>
                  <td>{booking.date}</td>
                  <td>${booking.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${booking.status === 'Confirmed' ? 'success' : 'warning'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1">View</button>
                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card card-purple">
            <div className="card-body">
              <h5 className="card-title text-purple">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-gradient-purple">Manage Cruises</button>
                <button className="btn btn-gradient-purple">Manage Customers</button>
                <button className="btn btn-gradient-purple">View Reports</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
