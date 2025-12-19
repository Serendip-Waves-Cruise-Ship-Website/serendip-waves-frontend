import { useAuth } from '../../contexts/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const mockBookings = [
    { id: 1, cruise: 'Caribbean Paradise', date: '2025-06-15', status: 'Confirmed', amount: 1200 },
    { id: 2, cruise: 'Mediterranean Dream', date: '2025-08-20', status: 'Pending', amount: 1800 }
  ];

  return (
    <div className="customer-dashboard">
      <h1 className="mb-4 text-purple">Welcome, {user?.name || 'Customer'}!</h1>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{mockBookings.length}</h3>
              <p className="mb-0">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{mockBookings.filter(b => b.status === 'Confirmed').length}</h3>
              <p className="mb-0">Confirmed Trips</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">${mockBookings.reduce((sum, b) => sum + b.amount, 0)}</h3>
              <p className="mb-0">Total Spent (USD)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-purple">
        <div className="card-body">
          <h5 className="card-title text-purple">My Bookings</h5>
          <table className="table table-purple">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Cruise</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount (USD)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.cruise}</td>
                  <td>{booking.date}</td>
                  <td>
                    <span className={`badge bg-${booking.status === 'Confirmed' ? 'success' : 'warning'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>${booking.amount.toFixed(2)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
