const StaffDashboard = () => {
  const tasks = [
    { id: 1, task: 'Clean Deck A', status: 'Pending', priority: 'High' },
    { id: 2, task: 'Room Service - 305', status: 'In Progress', priority: 'Medium' },
    { id: 3, task: 'Maintenance Check', status: 'Completed', priority: 'Low' }
  ];

  return (
    <div className="staff-dashboard">
      <h1 className="mb-4 text-purple">Staff Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">12</h3>
              <p className="mb-0">Pending Tasks</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">8</h3>
              <p className="mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">45</h3>
              <p className="mb-0">Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-purple mb-4">
        <div className="card-body">
          <h5 className="card-title text-purple">My Tasks</h5>
          <table className="table table-purple">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>#{task.id}</td>
                  <td>{task.task}</td>
                  <td>
                    <span className={`badge bg-${
                      task.status === 'Completed' ? 'success' : 
                      task.status === 'In Progress' ? 'warning' : 
                      'secondary'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${
                      task.priority === 'High' ? 'danger' : 
                      task.priority === 'Medium' ? 'warning' : 
                      'info'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1">Update</button>
                    <button className="btn btn-sm btn-outline-success">Complete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-purple">
        <div className="card-body">
          <h5 className="card-title text-purple">Quick Actions</h5>
          <div className="d-grid gap-2">
            <button className="btn btn-gradient-purple">Request Supplies</button>
            <button className="btn btn-gradient-purple">Report Issue</button>
            <button className="btn btn-gradient-purple">View Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
