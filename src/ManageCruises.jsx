import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaShip, FaUsers, FaSwimmingPool, FaLayerGroup } from 'react-icons/fa';
import './ManageCruises.css';
import axios from 'axios';
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';
import { useToast } from './hooks/useToast';

function ManageCruises() {
  const { logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = (to) => { window.location.href = to; };
  const [ships, setShips] = useState([]);
  const [filteredShips, setFilteredShips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingShip, setEditingShip] = useState(null);
  const [filters, setFilters] = useState({
    passengerCount: '',
    class: ''
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
    if (filters.passengerCount) {
      filtered = filtered.filter(ship => Number(ship.passenger_count) >= Number(filters.passengerCount));
    }
    if (filters.class) {
      filtered = filtered.filter(ship => ship.class === filters.class);
    }
    setFilteredShips(filtered);
  }, [filters, ships]);

  // Calculate summary statistics
  const totalShips = filteredShips.length;

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      passengerCount: '',
      class: ''
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
        showSuccess('Cruise ship updated successfully!');
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
        showSuccess('Cruise ship added successfully!');
      }
      handleCloseModal();
      fetchShips();
    } catch (error) {
      console.error('Error saving ship:', error);
      showError('Failed to save ship. Please try again.');
    }
  };

  const handleDeleteShip = async (shipName) => {
    showConfirm('Are you sure you want to delete this ship?', async () => {
      try {
        await axios.post('http://localhost/Project-I/backend/deleteShipDetails.php', { ship_name: shipName });
        showSuccess('Cruise ship deleted successfully!');
        fetchShips();
      } catch (error) {
        console.error('Error deleting ship:', error);
        showError('Failed to delete ship. Please try again.');
      }
    });
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
        <div className="filter-section container">
          <h3 className="filter-title">Filter Ships</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Min. Passenger Capacity</label>
              <input
                type="number"
                className="filter-input"
                value={filters.passengerCount}
                onChange={e => handleFilterChange('passengerCount', e.target.value)}
                placeholder="e.g. 2000"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Ship Class</label>
              <select
                className="filter-input"
                value={filters.class}
                onChange={e => handleFilterChange('class', e.target.value)}
              >
                <option value="">All Classes</option>
                <option value="Luxury">Luxury</option>
                <option value="Premium">Premium</option>
                <option value="Contemporary">Contemporary</option>
                <option value="Budget">Budget</option>
              </select>
            </div>
            <div className="filter-group">
              <div className="filter-actions">
                <Button className="clear-btn" onClick={clearFilters}>
                  <FaTimes /> Clear
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="container mb-4">
          <div className="row g-3 justify-content-center">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: '#f8f9fa', borderRadius: '12px' }}>
                <div className="card-body text-center p-3">
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <FaShip style={{ fontSize: '1.4rem', color: 'white' }} />
                  </div>
                  <h4 className="mb-1" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>{totalShips}</h4>
                  <p className="mb-0" style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: '500' }}>Total Ships</p>
                  <p className="mb-0" style={{ fontSize: '0.75rem', color: '#adb5bd', marginTop: '4px' }}>Active fleet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section container">
          <div className="table-header mb-3 d-flex justify-content-between align-items-center">
            <h3 className="table-title mb-0">Cruise Ships</h3>
            <Button className="add-btn" onClick={() => handleShowModal()}>
              <FaPlus /> Add Ship
            </Button>
          </div>
          
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                  <tr>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Ship Name</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Passengers</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Pools</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Decks</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Restaurants</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Image</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Class</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Year Built</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center" style={{ padding: '40px' }}>Loading...</td>
                    </tr>
                  ) : filteredShips.length > 0 ? (
                    filteredShips.map((ship, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '14px 12px' }}>
                          <strong style={{ color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaShip style={{ fontSize: '0.9rem' }} />
                            {ship.ship_name}
                          </strong>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#e7f0ff', color: '#667eea', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            <FaUsers style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                            {ship.passenger_count}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#e3f2fd', color: '#0277bd', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            <FaSwimmingPool style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                            {ship.pool_count}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#fff4e6', color: '#e65100', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            <FaLayerGroup style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                            {ship.deck_count}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#d4f4dd', color: '#1e7e34', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            {ship.restaurant_count}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          {ship.ship_image && (
                            <img 
                              src={`http://localhost/Project-I/backend/${ship.ship_image}`} 
                              alt={ship.ship_name} 
                              style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                            />
                          )}
                        </td>
                        <td style={{ padding: '14px 12px', color: '#666' }}>{ship.class || '-'}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '500' }}>{ship.year_built || '-'}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                              title="Edit"
                              onClick={() => handleShowModal(ship)}
                              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                              <FaEdit />
                            </button>
                            <button
                              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                              title="Delete"
                              onClick={() => handleDeleteShip(ship.ship_name)}
                              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted" style={{ padding: '40px' }}>
                        <div style={{ fontSize: '1.1rem' }}>
                          <FaShip style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                          <div>No ships found</div>
                          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
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
          </div>
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

export default ManageCruises; 