const SuperAdminDashboard = () => {
  const systemStats = {
    totalUsers: 1250,
    totalAdmins: 15,
    totalRevenue: 850000,
    systemHealth: 'Excellent'
  };

  return (
    <div className="superadmin-dashboard">
      <h1 className="mb-4 text-purple">Super Admin Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{systemStats.totalUsers}</h3>
              <p className="mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">{systemStats.totalAdmins}</h3>
              <p className="mb-0">Administrators</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">${systemStats.totalRevenue.toLocaleString()}</h3>
              <p className="mb-0">Total Revenue (USD)</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-success">{systemStats.systemHealth}</h3>
              <p className="mb-0">System Health</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card card-purple mb-4">
            <div className="card-body">
              <h5 className="card-title text-purple">User Management</h5>
              <table className="table table-purple table-sm">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Customers</td>
                    <td>1000</td>
                    <td><button className="btn btn-sm btn-outline-primary">Manage</button></td>
                  </tr>
                  <tr>
                    <td>Staff</td>
                    <td>200</td>
                    <td><button className="btn btn-sm btn-outline-primary">Manage</button></td>
                  </tr>
                  <tr>
                    <td>Chefs</td>
                    <td>35</td>
                    <td><button className="btn btn-sm btn-outline-primary">Manage</button></td>
                  </tr>
                  <tr>
                    <td>Admins</td>
                    <td>15</td>
                    <td><button className="btn btn-sm btn-outline-primary">Manage</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card card-purple mb-4">
            <div className="card-body">
              <h5 className="card-title text-purple">System Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-gradient-purple">System Settings</button>
                <button className="btn btn-gradient-purple">Database Backup</button>
                <button className="btn btn-gradient-purple">Security Audit</button>
                <button className="btn btn-gradient-purple">View All Logs</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
