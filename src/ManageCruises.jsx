import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaShip } from 'react-icons/fa';
import './ManageCruises.css';
import axios from 'axios';
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';

function ManageCruises() {
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = (to) => { window.location.href = to; };
  const [ships, setShips] = useState([]);
  const [filteredShips, setFilteredShips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingShip, setEditingShip] = useState(null);
  const [filters, setFilters] = useState({
    shipName: '',
    passengerCount: '',
    poolCount: '',
    deckCount: '',
    restaurantCount: ''
  });
  const [availableShipNames, setAvailableShipNames] = useState([]);
  const [formData, setFormData] = useState({
    ship_name: '',
    passenger_count: '',
    pool_count: '',
    deck_count: '',
    restaurant_count: '',
    about_ship: '',
    ship_image: '', // for display
    ship_image_file: null, // for upload
    class: '',
    year_built: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch ships from backend
  const fetchShips = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost/Project-I/backend/getShipDetails.php');
      setShips(res.data);
      setFilteredShips(res.data);
      setAvailableShipNames([...new Set(res.data.map(s => s.ship_name))]);
    } catch {
      setShips([]);
      setFilteredShips([]);
      setAvailableShipNames([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShips();
  }, []);

  useEffect(() => {
    let filtered = ships;
    if (filters.shipName) {
      filtered = filtered.filter(ship => ship.ship_name === filters.shipName);
    }
    if (filters.passengerCount) {
      filtered = filtered.filter(ship => Number(ship.passenger_count) === Number(filters.passengerCount));
    }
    if (filters.poolCount) {
      filtered = filtered.filter(ship => Number(ship.pool_count) === Number(filters.poolCount));
    }
    if (filters.deckCount) {
      filtered = filtered.filter(ship => Number(ship.deck_count) === Number(filters.deckCount));
    }
    if (filters.restaurantCount) {
      filtered = filtered.filter(ship => Number(ship.restaurant_count) === Number(filters.restaurantCount));
    }
    setFilteredShips(filtered);
  }, [filters, ships]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      shipName: '',
      passengerCount: '',
      poolCount: '',
      deckCount: '',
      restaurantCount: ''
    });
  };

  const handleShowModal = (ship = null) => {
    setEditingShip(ship);
    if (ship) {
      setFormData({ ...ship });
    } else {
      setFormData({
        ship_name: '',
        passenger_count: '',
        pool_count: '',
        deck_count: '',
        restaurant_count: '',
        about_ship: '',
        ship_image: '',
        ship_image_file: null,
        class: '',
        year_built: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShip(null);
    setFormData({
      ship_name: '',
      passenger_count: '',
      pool_count: '',
      deck_count: '',
      restaurant_count: '',
      about_ship: '',
      ship_image: '',
      ship_image_file: null,
      class: '',
      year_built: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ship_name) newErrors.ship_name = 'Ship name is required';
    if (!formData.passenger_count) newErrors.passenger_count = 'Passenger count is required';
    if (!formData.pool_count) newErrors.pool_count = 'Pool count is required';
    if (!formData.deck_count) newErrors.deck_count = 'Deck count is required';
    if (!formData.restaurant_count) newErrors.restaurant_count = 'Restaurant count is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (editingShip) {
        // Edit with image upload support
        const data = new FormData();
        data.append('ship_name', formData.ship_name);
        data.append('passenger_count', formData.passenger_count);
        data.append('pool_count', formData.pool_count);
        data.append('deck_count', formData.deck_count);
        data.append('restaurant_count', formData.restaurant_count);
        data.append('about_ship', formData.about_ship);
        data.append('class', formData.class);
        data.append('year_built', formData.year_built);
        data.append('existing_ship_image', editingShip.ship_image || '');
        if (formData.ship_image_file) {
          data.append('ship_image', formData.ship_image_file);
        }
        await axios.post('http://localhost/Project-I/backend/updateShipDetails.php', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Add with image upload
        const data = new FormData();
        data.append('ship_name', formData.ship_name);
        data.append('passenger_count', formData.passenger_count);
        data.append('pool_count', formData.pool_count);
        data.append('deck_count', formData.deck_count);
        data.append('restaurant_count', formData.restaurant_count);
        data.append('about_ship', formData.about_ship);
        data.append('class', formData.class);
        data.append('year_built', formData.year_built);
        if (formData.ship_image_file) {
          data.append('ship_image', formData.ship_image_file);
        }
        await axios.post('http://localhost/Project-I/backend/addShipDetails.php', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      handleCloseModal();
      fetchShips();
    } catch {
      alert('Failed to save ship.');
    }
  };

  const handleDeleteShip = async (shipName) => {
    if (window.confirm('Are you sure you want to delete this ship?')) {
      try {
        await axios.post('http://localhost/Project-I/backend/deleteShipDetails.php', { ship_name: shipName });
        fetchShips();
      } catch {
        alert('Failed to delete ship.');
      }
    }
  };

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
          Manage Cruises
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
        {/* Header */}
        <div className="itinerary-header"></div>

        {/* Filter Section */}
        <div className="filter-section">
          <h3 className="filter-title">Filter Ships</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Ship Name</label>
              <select
                className="filter-input"
                value={filters.shipName}
                onChange={e => handleFilterChange('shipName', e.target.value)}
              >
                <option value="">All Ships</option>
                {availableShipNames.map(ship => (
                  <option key={ship} value={ship}>{ship}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Passenger Count</label>
              <input
                type="number"
                className="filter-input"
                value={filters.passengerCount}
                onChange={e => handleFilterChange('passengerCount', e.target.value)}
                placeholder="e.g. 2000"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Pool Count</label>
              <input
                type="number"
                className="filter-input"
                value={filters.poolCount}
                onChange={e => handleFilterChange('poolCount', e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Deck Count</label>
              <input
                type="number"
                className="filter-input"
                value={filters.deckCount}
                onChange={e => handleFilterChange('deckCount', e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Restaurant Count</label>
              <input
                type="number"
                className="filter-input"
                value={filters.restaurantCount}
                onChange={e => handleFilterChange('restaurantCount', e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div className="filter-group">
              <div className="filter-actions">
                <Button className="filter-btn" onClick={() => {}}>
                  <FaSearch /> Filter
                </Button>
                <Button className="clear-btn" onClick={clearFilters}>
                  <FaTimes /> Clear
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="table-header">
            <h3 className="table-title">Cruise Ships</h3>
            <Button className="add-btn" onClick={() => handleShowModal()}>
              <FaPlus /> Add Ship
            </Button>
          </div>
          <Table className="itinerary-table table-striped table-bordered">
            <thead>
              <tr>
                <th>Ship Name</th>
                <th>Passenger Count</th>
                <th>Pool Count</th>
                <th>Deck Count</th>
                <th>Restaurant Count</th>
                <th>Ship Image</th>
                <th>Class</th>
                <th>Year Built</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center">Loading...</td></tr>
              ) : filteredShips.length > 0 ? (
                filteredShips.map((ship, idx) => (
                  <tr key={idx}>
                    <td><strong>{ship.ship_name}</strong></td>
                    <td><Badge bg="light" text="dark" style={{ color: '#000', fontWeight: 'bold' }}>{ship.passenger_count}</Badge></td>
                    <td><Badge bg="light" text="dark" style={{ color: '#000', fontWeight: 'bold' }}>{ship.pool_count}</Badge></td>
                    <td><Badge bg="light" text="dark" style={{ color: '#000', fontWeight: 'bold' }}>{ship.deck_count}</Badge></td>
                    <td><Badge bg="light" text="dark" style={{ color: '#000', fontWeight: 'bold' }}>{ship.restaurant_count}</Badge></td>
                    <td>
                      {ship.ship_image && (
                        <img src={`http://localhost/Project-I/backend/${ship.ship_image}`} alt={ship.ship_name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      )}
                    </td>
                    <td>{ship.class}</td>
                    <td>{ship.year_built}</td>
                    <td>
                      <div className="horizontal-action-buttons">
                        <button
                          className="action-rect-btn edit"
                          title="Edit"
                          onClick={() => handleShowModal(ship)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-rect-btn delete"
                          title="Delete"
                          onClick={() => handleDeleteShip(ship.ship_name)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="empty-state">
                      <FaShip className="empty-state-icon" />
                      <div className="empty-state-text">No ships found</div>
                      <div className="empty-state-subtext">
                        {Object.values(filters).some(f => f)
                          ? 'Try adjusting your filters'
                          : 'Add your first ship to get started'
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingShip ? 'Edit Ship' : 'Add Ship'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Ship Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.ship_name || ""}
                  onChange={e => setFormData({ ...formData, ship_name: e.target.value })}
                  isInvalid={!!errors.ship_name}
                  disabled={!!editingShip}
                />
                <Form.Control.Feedback type="invalid">{errors.ship_name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Passenger Count *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.passenger_count || ""}
                  onChange={e => setFormData({ ...formData, passenger_count: e.target.value })}
                  isInvalid={!!errors.passenger_count}
                />
                <Form.Control.Feedback type="invalid">{errors.passenger_count}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Pool Count *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.pool_count || ""}
                  onChange={e => setFormData({ ...formData, pool_count: e.target.value })}
                  isInvalid={!!errors.pool_count}
                />
                <Form.Control.Feedback type="invalid">{errors.pool_count}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Deck Count *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.deck_count || ""}
                  onChange={e => setFormData({ ...formData, deck_count: e.target.value })}
                  isInvalid={!!errors.deck_count}
                />
                <Form.Control.Feedback type="invalid">{errors.deck_count}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Restaurant Count *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.restaurant_count || ""}
                  onChange={e => setFormData({ ...formData, restaurant_count: e.target.value })}
                  isInvalid={!!errors.restaurant_count}
                />
                <Form.Control.Feedback type="invalid">{errors.restaurant_count}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>About Ship</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.about_ship || ""}
                  onChange={e => setFormData({ ...formData, about_ship: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ship Image (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={e => setFormData({ ...formData, ship_image_file: e.target.files[0] })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Class</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.class || ""}
                  onChange={e => setFormData({ ...formData, class: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Year Built</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.year_built || ""}
                  onChange={e => setFormData({ ...formData, year_built: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingShip ? 'Update' : 'Save'}</Button>
          </Modal.Footer>
        </Modal>
      </div>
      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={handleCloseLogoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to logout?
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

export default ManageCruises; 