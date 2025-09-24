import React, { useState } from 'react';
// import passengerBookings from './data/passengerBookings.json'; // No longer needed, now using backend
import './PassengerDashboard.css';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function PassengerDashboard() {
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = (to) => { window.location.href = to; };
  const [data, setData] = useState([]);
  // Fetch passengers from backend
  React.useEffect(() => {
    fetch('http://localhost/Project-I/backend/getPassengersDirect.php')
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.passengers)) {
          setData(result.passengers);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]));
  }, []);
  const [search, setSearch] = useState('');
  const [shipFilter, setShipFilter] = useState('All Ships');

  // Get unique ship names for dropdown
  const shipNames = Array.from(new Set(data.map(b => b.ship_name)));

  // CRUD State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPassenger, setEditPassenger] = useState(null);
  const [newPassenger, setNewPassenger] = useState({
    booking_id: '', passenger_name: '', email: '', ship_id: '', ship_name: '', route: '', cabin_id: '', age: '', gender: '', citizenship: ''
  });
  const [crudError, setCrudError] = useState('');

  // Add Passenger
  const handleAdd = () => {
    setCrudError('');
    fetch('http://localhost/Project-I/backend/createPassenger.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPassenger)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setShowAddModal(false);
          setNewPassenger({ booking_id: '', passenger_name: '', email: '', ship_id: '', ship_name: '', route: '', cabin_id: '', age: '', gender: '', citizenship: '' });
          refreshPassengers();
        } else {
          setCrudError(result.message || 'Failed to add passenger');
        }
      })
      .catch(() => setCrudError('Network error'));
  };

  // Edit Passenger
  const handleEdit = (row) => {
    setEditPassenger(row);
    setShowEditModal(true);
    setCrudError('');
  };
  const handleEditSave = () => {
    setCrudError('');
    
    fetch('http://localhost/Project-I/backend/updatePassenger.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPassenger)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setShowEditModal(false);
          setEditPassenger(null);
          refreshPassengers();
        } else {
          setCrudError(result.message || 'Failed to update passenger');
        }
      })
      .catch(() => setCrudError('Network error'));
  };

  // Delete Passenger
  const handleDelete = (idx) => {
    const passenger = filtered[idx];
    if (!window.confirm('Delete this passenger?')) return;
    
    fetch('http://localhost/Project-I/backend/deletePassenger.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passenger_id: passenger.passenger_id })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          refreshPassengers();
        } else {
          alert(result.message || 'Failed to delete passenger');
        }
      })
      .catch(() => alert('Network error'));
  };

  // Refresh function
  const refreshPassengers = () => {
    fetch('http://localhost/Project-I/backend/getPassengersDirect.php')
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.passengers)) {
          setData(result.passengers);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]));
  };

  // Filter by search and ship name (using backend field names)
  const filtered = data.filter(row =>
    (shipFilter === 'All Ships' || row.ship_name === shipFilter) &&
    (
      (row.passenger_name && row.passenger_name.toLowerCase().includes(search.toLowerCase())) ||
      (row.email && row.email.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  // Custom Navbar (Admin Dashboard style)
  const navbar = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        minHeight: '60px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #eee'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: '45px', width: 'auto', maxWidth: '60px', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/#top')}
        />
        <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#1a237e', letterSpacing: '0.5px' }}>
          Passenger Management
        </div>
      </div>
      <button
        onClick={handleLogoutClick}
        className="superadmin-logout-btn"
      >
        Logout
      </button>
    </div>
  );

  // Add background and navbar wrapper
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 1rem',
      }}
    >
      {navbar}
      <div style={{ marginTop: '80px', width: '100%' }}>
        {/* Gradient Header */}
        <section className="booking-hero-section mb-4" style={{ minHeight: '220px', padding: '40px 0', background: 'transparent' }}>
          <div className="booking-hero-background"></div>
          <div className="booking-hero-content container text-center text-white">
            <h2 className="booking-hero-title mb-2" style={{ fontSize: '2.8rem' }}>
              Passenger Management Dashboard
            </h2>
            <p className="booking-hero-subtitle mb-0">
              View and manage all passenger bookings in one place.
            </p>
          </div>
        </section>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div></div>
            <div className="d-flex align-items-center gap-3">
              {/* Removed Super Admin name */}
            </div>
          </div>
          {/* Filter/Search Bar in Card */}
          <div className="card booking-glass-effect mb-4 p-3 shadow-lg border-0" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
              <InputGroup style={{ maxWidth: 340 }}>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="shadow-sm"
                />
                <Button variant="secondary" onClick={() => setSearch('')}>Clear</Button>
              </InputGroup>
              {/* Ship Name Dropdown Filter */}
              <Form.Select
                style={{ maxWidth: 220 }}
                value={shipFilter}
                onChange={e => setShipFilter(e.target.value)}
                className="shadow-sm"
              >
                <option>All Ships</option>
                {shipNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Form.Select>
              <Button variant="success" className="rounded-pill px-4" style={{ minWidth: 180 }} onClick={() => setShowAddModal(true)}>Add Passenger</Button>
            </div>
          </div>
          <div className="table-responsive passenger-table-wrapper">
            <table className="table table-striped table-bordered align-middle shadow-sm passenger-table">
              <thead className="table-primary">
                <tr>
                  <th>Booking ID</th>
                  <th>Passenger Name</th>
                  <th>Email</th>
                  <th>Ship Name</th>
                  <th>Route</th>
                  <th>Cabin ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center">No passengers found.</td></tr>
                ) : (
                  filtered.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.booking_id}</td>
                      <td>{row.passenger_name}</td>
                      <td>{row.email}</td>
                      <td><span className="badge bg-primary bg-opacity-75 rounded-pill px-3 py-2">{row.ship_name}</span></td>
                      <td><span className="badge bg-info bg-opacity-75 rounded-pill px-3 py-2">{row.route}</span></td>
                      <td>{row.cabin_id}</td>
                      <td>
                        <div className="horizontal-action-buttons">
                          <button
                            className="action-rect-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(row)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-rect-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(idx)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Add Passenger Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Passenger</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {crudError && <div className="alert alert-danger">{crudError}</div>}
          {Object.keys(newPassenger).map(key => (
            <Form.Group key={key} className="mb-2">
              <Form.Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
              <Form.Control
                type="text"
                value={newPassenger[key]}
                onChange={e => setNewPassenger({ ...newPassenger, [key]: e.target.value })}
              />
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAdd}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Edit Passenger Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Passenger</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {crudError && <div className="alert alert-danger">{crudError}</div>}
          {editPassenger && Object.keys(newPassenger).map(key => (
            <Form.Group key={key} className="mb-2">
              <Form.Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
              <Form.Control
                type="text"
                value={editPassenger[key] || ''}
                onChange={e => setEditPassenger({ ...editPassenger, [key]: e.target.value })}
              />
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={handleCloseLogoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Would you like to log out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmLogout}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PassengerDashboard; 