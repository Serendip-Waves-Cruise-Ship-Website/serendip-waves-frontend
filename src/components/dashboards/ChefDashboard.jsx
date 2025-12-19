const ChefDashboard = () => {
  const menuItems = [
    { id: 1, name: 'Lobster Thermidor', category: 'Main Course', available: true },
    { id: 2, name: 'Beef Wellington', category: 'Main Course', available: true },
    { id: 3, name: 'Tiramisu', category: 'Dessert', available: false }
  ];

  return (
    <div className="chef-dashboard">
      <h1 className="mb-4 text-purple">Chef Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">45</h3>
              <p className="mb-0">Today's Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">23</h3>
              <p className="mb-0">Menu Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-purple dashboard-card">
            <div className="card-body text-center">
              <h3 className="text-purple">4.8/5</h3>
              <p className="mb-0">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-purple mb-4">
        <div className="card-body">
          <h5 className="card-title text-purple">Menu Management</h5>
          <table className="table table-purple">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={`badge bg-${item.available ? 'success' : 'danger'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1">Edit</button>
                    <button className="btn btn-sm btn-outline-danger">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-gradient-purple mt-3">Add New Menu Item</button>
        </div>
      </div>

      <div className="card card-purple">
        <div className="card-body">
          <h5 className="card-title text-purple">Today's Specials</h5>
          <div className="d-grid gap-2">
            <button className="btn btn-gradient-purple">Set Today's Special</button>
            <button className="btn btn-gradient-purple">View Inventory</button>
            <button className="btn btn-gradient-purple">Special Requests</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
