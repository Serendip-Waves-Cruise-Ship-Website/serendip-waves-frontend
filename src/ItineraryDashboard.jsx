import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaRoute, FaShip, FaGlobe, FaCalendarAlt } from 'react-icons/fa';
import './itinerary.css';
import axios from 'axios';
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';
import { useToast } from './hooks/useToast';

// Remove static shipNames
// const shipNames = [ ... ];

// Common countries for dropdown
const _countries = [
  'Sri Lanka',
  'Maldives',
  'India',
  'Thailand',
  'Malaysia',
  'Singapore',
  'Indonesia',
  'Philippines',
  'Vietnam',
  'Myanmar'
];

// Common ports for dropdown
const _commonPorts = [
  'Colombo',
  'Galle',
  'Trincomalee',
  'Jaffna',
  'Hambantota',
  'Maldives',
  'Mumbai',
  'Chennai',
  'Bangkok',
  'Singapore',
  'Kuala Lumpur',
  'Jakarta',
  'Manila',
  'Ho Chi Minh City',
  'Yangon'
];

function ItineraryDashboard() {
  const { logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = (to) => { window.location.href = to; };
  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [filters, setFilters] = useState({
    shipName: '',
    arrivalCountry: ''
  });
  const [availableShipNames, setAvailableShipNames] = useState([]); // Now dynamic
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [showAddShipModal, setShowAddShipModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newShipName, setNewShipName] = useState('');
  const [newRouteData, setNewRouteData] = useState({
    departurePort: '',
    arrivalCountry: ''
  });

  // Fetch itineraries from backend
  const fetchItineraries = async () => {
    try {
      const response = await axios.get("http://localhost/Project-I/backend/getItineraries.php");
      const data = response.data;
      setItineraries(data);
      setFilteredItineraries(data);
      // Extract countries dynamically
      const countries = [...new Set(data.map(item => item.route))];
      setAvailableCountries(countries);
    } catch (error) {
      console.error("Failed to fetch itineraries:", error);
    }
  };

  // Fetch ships from backend for dropdowns
  useEffect(() => {
    async function fetchShips() {
      try {
        const res = await axios.get('http://localhost/Project-I/backend/getShipDetails.php');
        setAvailableShipNames(res.data.map(ship => ship.ship_name));
      } catch {
        setAvailableShipNames([]);
      }
    }
    fetchShips();
  }, []);

  useEffect(() => {
    fetchItineraries();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    let filtered = itineraries;

    if (filters.shipName) {
      filtered = filtered.filter(item => 
        item.ship_name.toLowerCase().includes(filters.shipName.toLowerCase())
      );
    }

    if (filters.arrivalCountry) {
      filtered = filtered.filter(item => 
        item.route.toLowerCase().includes(filters.arrivalCountry.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(item => 
        new Date(item.start_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(item => 
        new Date(item.end_date) <= new Date(filters.endDate)
      );
    }

    setFilteredItineraries(filtered);
  }, [filters, itineraries]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      shipName: '',
      arrivalCountry: ''
    });
  };

  const handleShowModal = (itinerary = null) => {
    setEditingItinerary(itinerary);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItinerary(null);
  };

  const handleSaveItinerary = async (formData) => {
    try {
      let url, data, headers;
      const formDataToSend = new FormData();
      formDataToSend.append('ship_name', formData.shipName);
      formDataToSend.append('route', formData.arrivalCountry);
      formDataToSend.append('departure_port', formData.departurePort);
      formDataToSend.append('start_date', formData.startDate);
      formDataToSend.append('end_date', formData.endDate);
      formDataToSend.append('notes', formData.notes);
      if (editingItinerary) {
        url = "http://localhost/Project-I/backend/updateItenerary.php";
        formDataToSend.append('id', editingItinerary.id);
        // Only append image if a new one is selected
        if (formData.countryImage) {
          formDataToSend.append('country_image', formData.countryImage);
        }
      } else {
        url = "http://localhost/Project-I/backend/addItinerary.php";
        if (formData.countryImage) {
          formDataToSend.append('country_image', formData.countryImage);
        }
      }
      data = formDataToSend;
      headers = { 'Content-Type': 'multipart/form-data' };
      const res = await axios.post(url, data, { headers });
      if (res.status === 200) {
        showSuccess(res.data.message || "Itinerary saved successfully!");
        await fetchItineraries();
        handleCloseModal();
      } else {
        showError(res.data.message || "Failed to save itinerary.");
      }
    } catch (error) {
      showError("Failed to save itinerary. Please check your backend.");
      console.error(error);
    }
  };
  

  const handleDeleteItinerary = async (id) => {
    showConfirm('Are you sure you want to delete this itinerary?', async () => {
      try {
        const res = await axios.post(
          "http://localhost/Project-I/backend/deleteItenerary.php",
          { id },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.status === 200) {
          showSuccess(res.data.message || "Itinerary deleted successfully!");
          await fetchItineraries();
        } else {
          showError(res.data.message || "Failed to delete itinerary.");
        }
      } catch (error) {
        showError("Failed to delete itinerary. Please check your backend.");
        console.error(error);
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          Itinerary Management
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
        {/* Header */}
        {/* Filter Section */}
        <div className="filter-section container">
          <h3 className="filter-title">Filter Itineraries</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Ship Name</label>
              <select
                className="filter-input"
                value={filters.shipName}
                onChange={(e) => handleFilterChange('shipName', e.target.value)}
              >
                <option value="">All Ships</option>
                {availableShipNames.map(ship => (
                  <option key={ship} value={ship}>{ship}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Destination</label>
              <select
                className="filter-input"
                value={filters.arrivalCountry}
                onChange={(e) => handleFilterChange('arrivalCountry', e.target.value)}
              >
                <option value="">All Destinations</option>
                {availableCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
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

        {/* Summary Cards */}
        <div className="container mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px' }}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Itineraries</p>
                      <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{filteredItineraries.length}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                      <FaRoute style={{ fontSize: '1.8rem' }} />
                    </div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Scheduled cruises</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px' }}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Ships</p>
                      <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{new Set(filteredItineraries.map(i => i.ship_name)).size}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                      <FaShip style={{ fontSize: '1.8rem' }} />
                    </div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Fleet in service</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px' }}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Destinations</p>
                      <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{new Set(filteredItineraries.map(i => i.route)).size}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                      <FaGlobe style={{ fontSize: '1.8rem' }} />
                    </div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Countries covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section container">
          <div className="table-header mb-3 d-flex justify-content-between align-items-center">
            <h3 className="table-title mb-0">Cruise Itineraries</h3>
            <Button className="add-btn" onClick={() => handleShowModal()}>
              <FaPlus /> Add Itinerary
            </Button>
          </div>
          
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                  <tr>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Ship Name</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Departure Port</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Arrival Country</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Start Date</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>End Date</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Image</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItineraries.length > 0 ? (
                    filteredItineraries.map((itinerary, index) => (
                      <tr key={itinerary.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '14px 12px' }}>
                          <strong style={{ color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaShip style={{ fontSize: '0.9rem' }} />
                            {itinerary.ship_name}
                          </strong>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ background: '#e7f0ff', color: '#667eea', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            {itinerary.departure_port}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            <FaGlobe style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                            {itinerary.route}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', color: '#666' }}>
                          <FaCalendarAlt style={{ marginRight: '6px', fontSize: '0.85rem', color: '#667eea' }} />
                          {formatDate(itinerary.start_date)}
                        </td>
                        <td style={{ padding: '14px 12px', color: '#666' }}>
                          <FaCalendarAlt style={{ marginRight: '6px', fontSize: '0.85rem', color: '#667eea' }} />
                          {formatDate(itinerary.end_date)}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          {itinerary.country_image && (
                            <img 
                              src={`http://localhost/Project-I/backend/${itinerary.country_image}`} 
                              alt="Country" 
                              style={{ 
                                width: 60, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }} 
                            />
                          )}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              title="Edit"
                              onClick={() => handleShowModal(itinerary)}
                              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                              <FaEdit />
                            </button>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              title="Delete"
                              onClick={() => handleDeleteItinerary(itinerary.id)}
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
                      <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                        <div style={{ fontSize: '1.1rem' }}>
                          <FaRoute style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                          <div className="empty-state-text">No itineraries found</div>
                          <div className="empty-state-subtext">
                            {Object.values(filters).some(f => f) 
                              ? 'Try adjusting your filters' 
                              : 'Add your first itinerary to get started'
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
        <ItineraryModal
          show={showModal}
          onHide={handleCloseModal}
          itinerary={editingItinerary}
          onSave={handleSaveItinerary}
          shipNames={availableShipNames}
          countries={availableCountries}
          ports={availablePorts}
          setShipNames={setAvailableShipNames}
          setCountries={setAvailableCountries}
          setPorts={setAvailablePorts}
          setShowAddShipModal={setShowAddShipModal}
          setShowAddRouteModal={setShowAddRouteModal}
          setNewShipName={setNewShipName}
          setNewRouteData={setNewRouteData}
        />

        {/* Add Ship Modal */}
        <Modal show={showAddShipModal} onHide={() => setShowAddShipModal(false)} size="sm" centered>
          <Modal.Header closeButton>
            <Modal.Title>Add New Ship</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Ship Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter ship name..."
                value={newShipName}
                onChange={(e) => setNewShipName(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddShipModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (newShipName.trim()) {
                  setAvailableShipNames(prev => [...prev, newShipName.trim()]);
                  setNewShipName('');
                  setShowAddShipModal(false);
                }
              }}
            >
              Add Ship
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Route Modal */}
        <Modal show={showAddRouteModal} onHide={() => setShowAddRouteModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Add New Country</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Arrival Country *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter country name..."
                    value={newRouteData.arrivalCountry}
                    onChange={(e) => setNewRouteData(prev => ({ ...prev, arrivalCountry: e.target.value }))}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddRouteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={() => {
                if (newRouteData.arrivalCountry) {
                  // Add new country if it doesn't exist
                  if (!availableCountries.includes(newRouteData.arrivalCountry)) {
                    setAvailableCountries(prev => [...prev, newRouteData.arrivalCountry]);
                  }
                  setNewRouteData({ arrivalCountry: '' });
                  setShowAddRouteModal(false);
                }
              }}
            >
              Add Country
            </Button>
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

// Modal Component
function ItineraryModal({ show, onHide, itinerary, onSave, shipNames }) {
  const [formData, setFormData] = useState({
    shipName: '',
    departurePort: '',
    arrivalCountry: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or itinerary changes
  useEffect(() => {
    if (show) {
      if (itinerary) {
        // Map backend field names to form field names
        setFormData({
          shipName: itinerary.ship_name || '',
          departurePort: itinerary.departure_port || '',
          arrivalCountry: itinerary.route || '',
          startDate: itinerary.start_date || '',
          endDate: itinerary.end_date || '',
          notes: itinerary.notes || ''
        });
      } else {
        setFormData({
          shipName: '',
          departurePort: '',
          arrivalCountry: '',
          startDate: '',
          endDate: '',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [show, itinerary]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shipName) newErrors.shipName = 'Ship name is required';
    if (!formData.departurePort) newErrors.departurePort = 'Departure port is required';
    if (!formData.arrivalCountry) newErrors.arrivalCountry = 'Arrival country is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {itinerary ? 'Edit Itinerary' : 'Add New Itinerary'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label>Ship Name *</Form.Label>
                <Form.Select
                  className={errors.shipName ? 'is-invalid' : ''}
                  value={formData.shipName}
                  onChange={e => handleInputChange('shipName', e.target.value)}
                >
                  <option value="">Select a ship</option>
                  {shipNames && shipNames.map((ship, idx) => (
                    <option key={idx} value={ship}>{ship}</option>
                  ))}
                </Form.Select>
                {errors.shipName && <div className="invalid-feedback">{errors.shipName}</div>}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label>Route (Destination/Arrival Country) *</Form.Label>
                <Form.Control
                  type="text"
                  className={errors.arrivalCountry ? 'is-invalid' : ''}
                  placeholder="Enter country name..."
                  value={formData.arrivalCountry}
                  onChange={(e) => handleInputChange('arrivalCountry', e.target.value)}
                />
                {errors.arrivalCountry && <div className="invalid-feedback">{errors.arrivalCountry}</div>}
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label>Departure Port *</Form.Label>
                <Form.Control
                  type="text"
                  className={errors.departurePort ? 'is-invalid' : ''}
                  placeholder="e.g., Colombo"
                  value={formData.departurePort}
                  onChange={(e) => handleInputChange('departurePort', e.target.value)}
                />
                {errors.departurePort && <div className="invalid-feedback">{errors.departurePort}</div>}
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="date"
                  className={errors.startDate ? 'is-invalid' : ''}
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="form-group">
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="date"
                  className={errors.endDate ? 'is-invalid' : ''}
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
                {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
              </Form.Group>
            </div>
          </div>

          <Form.Group className="form-group">
            <Form.Label>Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows="3"
              placeholder="Additional notes about this itinerary..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Country Image (Optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={e => setFormData(prev => ({
                ...prev,
                countryImage: e.target.files[0]
              }))}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-cancel" onClick={onHide}>
          Cancel
        </Button>
        <Button className="btn-save" onClick={handleSubmit}>
          {itinerary ? 'Update' : 'Save'} Itinerary
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ItineraryDashboard; 