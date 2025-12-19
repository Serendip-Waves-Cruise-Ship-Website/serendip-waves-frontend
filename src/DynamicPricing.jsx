import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { useToast } from './hooks/useToast';
import logo from './assets/logo.png';
import './itinerary.css';

const DynamicPricing = () => {
  const { logout } = useContext(AuthContext);
  const { showConfirm } = useToast();
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [_itineraries, _setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    shipName: searchParams.get('ship') || '',
    route: searchParams.get('route') || ''
  });
  
  const [availableShips, setAvailableShips] = useState([]);
  const [shipDetails, setShipDetails] = useState([]); // Store full ship data with ship_id
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [form, setForm] = useState({
    ship_id: '',
    ship_name: '',
    route: '',
    interior_price: '',
    ocean_view_price: '',
    balcony_price: '',
    suite_price: ''
  });

  useEffect(() => {
    // Load initial data and apply any URL filters
    const initialFilters = {
      shipName: searchParams.get('ship') || '',
      route: searchParams.get('route') || ''
    };
    
    setFilters(initialFilters);
    fetchPricing(initialFilters);
    fetchItineraries();
    fetchAvailableShips();
  }, [searchParams]);

  // Update URL parameters when filters change (with debounce to prevent rapid updates)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (filters.shipName) params.set('ship', filters.shipName);
      if (filters.route) params.set('route', filters.route);
      
      const newSearch = params.toString();
      const currentSearch = searchParams.toString();
      
      if (newSearch !== currentSearch) {
        setSearchParams(params);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, setSearchParams, searchParams]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      shipName: '',
      route: ''
    });
    setSearchParams({});
  };

  const applyFilters = () => {
    // Fetch pricing with current filters applied on backend
    fetchPricing(filters);
    console.log('Filters applied:', filters);
  };

  const fetchItineraries = async () => {
    try {
      const res = await fetch('http://localhost/Project-I/backend/getItineraries.php');
      const data = await res.json();
      _setItineraries(data);
      
      // Extract unique routes from itineraries
      if (data && Array.isArray(data)) {
        const routes = [...new Set(data.map(item => item.route).filter(route => route && route.trim() !== ''))];
        setAvailableRoutes(routes.sort());
      }
    } catch {
      _setItineraries([]);
    }
  };

  const fetchAvailableShips = async () => {
    try {
      const res = await fetch('http://localhost/Project-I/backend/getShipDetails.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setShipDetails(data); // Store full ship data
        const ships = [...new Set(data.map(ship => ship.ship_name))];
        setAvailableShips(ships.sort());
      }
    } catch (error) {
      console.error('Error fetching ship details:', error);
      // Fallback to ships from pricing data
      setAvailableShips([]);
      setShipDetails([]);
    }
  };

  // Helper function to get ship_id from ship_name
  const getShipIdFromName = (shipName) => {
    const ship = shipDetails.find(s => s.ship_name === shipName);
    return ship ? ship.ship_id : null;
  };

  const fetchPricing = async (filterParams = {}) => {
    setLoading(true);
    setError('');
    try {
      // Build query parameters for API call
      const queryParams = new URLSearchParams();
      
      if (filterParams.shipName) queryParams.set('ship', filterParams.shipName);
      if (filterParams.route) queryParams.set('route', filterParams.route);
      if (filterParams.minPrice) queryParams.set('minPrice', filterParams.minPrice);
      if (filterParams.maxPrice) queryParams.set('maxPrice', filterParams.maxPrice);
      
      const apiUrl = `http://localhost/Project-I/backend/getCabinTypePricing.php${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data.success) {
        setFilteredPricing(data.pricing);
        
        // Merge ships from pricing with ships from ship details (avoid duplicates)
        const pricingShips = [...new Set(data.pricing.map(item => item.ship_name))];
        setAvailableShips(prev => {
          const merged = [...new Set([...prev, ...pricingShips])];
          return merged.sort();
        });
        
        // Merge routes from pricing with routes from itineraries (avoid duplicates)  
        const pricingRoutes = [...new Set(data.pricing.map(item => item.route))];
        setAvailableRoutes(prev => {
          const merged = [...new Set([...prev, ...pricingRoutes])];
          return merged.sort();
        });
      } else {
        setError(data.message || 'Failed to fetch pricing');
      }
    } catch {
      setError('Error fetching pricing');
    }
    setLoading(false);
  };

  const resetModalState = () => {
    setForm({ ship_id: '', ship_name: '', route: '', interior_price: '', ocean_view_price: '', balcony_price: '', suite_price: '' });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    // Include ship_id if available from the item
    const formData = { 
      ...item,
      ship_id: item.ship_id || getShipIdFromName(item.ship_name) || ''
    };
    setForm(formData);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    
    // If ship_name is being changed, also update ship_id
    if (name === 'ship_name') {
      const shipId = getShipIdFromName(value);
      updatedForm.ship_id = shipId;
    }
    
    setForm(updatedForm);
  };

  const handleSave = async () => {
    try {
      const endpoint = editItem 
        ? 'http://localhost/Project-I/backend/updateCabinTypePricing.php'
        : 'http://localhost/Project-I/backend/addCabinTypePricing.php';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        // Immediately update available options if we're adding new ones
        if (!editItem) {
          if (form.ship_name && !availableShips.includes(form.ship_name)) {
            setAvailableShips(prev => [...prev, form.ship_name].sort());
          }
          if (form.route && !availableRoutes.includes(form.route)) {
            setAvailableRoutes(prev => [...prev, form.route].sort());
          }
        }
        
        fetchPricing(filters); // This will also refresh the options
        setShowModal(false);
        resetModalState();
      } else {
        setError(data.message || 'Failed to save pricing');
        console.error('Save failed:', data.message); // Debug log
      }
    } catch (error) {
      setError('Error saving pricing');
      console.error('Save error:', error); // Debug log
    }
  };

  const handleDelete = async (item) => {
    showConfirm('Are you sure you want to delete this pricing item?', async () => {
      try {
        const res = await fetch('http://localhost/Project-I/backend/deleteCabinTypePricing.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id })
        });
        const data = await res.json();
        if (data.success) {
          fetchPricing(filters);
        } else {
          setError(data.message || 'Failed to delete pricing');
        }
      } catch {
        setError('Error deleting pricing');
      }
    });
  };

  const handleLogoutClick = () => {
    showConfirm('Are you sure you want to logout?', () => {
      logout();
      navigate('/');
    });
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Custom Navbar */}
      <div style={{
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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: '45px', width: 'auto', maxWidth: '60px', cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => navigate('/')}
          />
          <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#1a237e', letterSpacing: '0.5px' }}>
            Dynamic Pricing Management
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={handleLogoutClick}
            className="superadmin-logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
      {/* End Custom Navbar */}
      <div style={{ marginTop: '80px', width: '100%' }}>
        {/* Filter Section */}
        <div className="filter-section container" style={{ marginBottom: '2rem' }}>
          <h3 className="filter-title">Filter Pricing</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Ship Name</label>
              <select
                className="filter-input"
                value={filters.shipName}
                onChange={(e) => handleFilterChange('shipName', e.target.value)}
              >
                <option value="">All Ships</option>
                {availableShips.map(ship => (
                  <option key={ship} value={ship}>{ship}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Route</label>
              <select
                className="filter-input"
                value={filters.route}
                onChange={(e) => handleFilterChange('route', e.target.value)}
              >
                <option value="">All Routes</option>
                {availableRoutes.map(route => (
                  <option key={route} value={route}>{route}</option>
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
        
        <div className="container">
          <div className="table-header mb-3 d-flex justify-content-between align-items-center">
            <h3 className="table-title mb-0">Dynamic Cabin Type Pricing</h3>
            <Button className="add-btn" onClick={() => {
              setEditItem(null);
              resetModalState();
              setShowModal(true);
            }}>
              <FaPlus /> Add Pricing
            </Button>
          </div>
          
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                  <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                    <tr>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Ship Name</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Route</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Interior</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Ocean View</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Balcony</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Suite</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPricing.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '500' }}>{item.ship_name}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>{item.route}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#2c3e50' }}>${item.interior_price}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#2c3e50' }}>${item.ocean_view_price}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#2c3e50' }}>${item.balcony_price}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#2c3e50' }}>${item.suite_price}</td>
                        <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'white',
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease',
                          padding: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                        }}
                        title="Edit"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'white',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease',
                          padding: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                        }}
                        title="Delete"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </div>
        <Modal show={showModal} onHide={() => {
          setShowModal(false);
          resetModalState();
        }}>
          <Modal.Header closeButton>
            <Modal.Title>{editItem ? 'Edit Pricing' : 'Add Pricing'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Ship Name</Form.Label>
                <Form.Control
                  as="select"
                  name="ship_name"
                  value={form.ship_name}
                  onChange={handleChange}
                >
                  <option value="">Select Ship Name</option>
                  {availableShips.map((ship, index) => (
                    <option key={index} value={ship}>{ship}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Route</Form.Label>
                <Form.Control
                  as="select"
                  name="route"
                  value={form.route}
                  onChange={handleChange}
                >
                  <option value="">Select Route</option>
                  {availableRoutes.map((route, index) => (
                    <option key={index} value={route}>{route}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Interior Price</Form.Label>
                <Form.Control
                  type="number"
                  name="interior_price"
                  value={form.interior_price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ocean View Price</Form.Label>
                <Form.Control
                  type="number"
                  name="ocean_view_price"
                  value={form.ocean_view_price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Balcony Price</Form.Label>
                <Form.Control
                  type="number"
                  name="balcony_price"
                  value={form.balcony_price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Suite Price</Form.Label>
                <Form.Control
                  type="number"
                  name="suite_price"
                  value={form.suite_price}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowModal(false);
              resetModalState();
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default DynamicPricing;
