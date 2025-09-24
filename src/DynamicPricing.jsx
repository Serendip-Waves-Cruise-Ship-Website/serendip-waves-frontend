import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import logo from './assets/logo.png';

const DynamicPricing = () => {
  const { logout } = useContext(AuthContext);
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
    route: searchParams.get('route') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
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
      route: searchParams.get('route') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || ''
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
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      
      // Update URL without causing a page reload
      const newSearch = params.toString();
      const currentSearch = searchParams.toString();
      
      if (newSearch !== currentSearch) {
        // Don't use replace: true to maintain browser history for back navigation
        setSearchParams(params);
      }
    }, 300); // 300ms debounce
    
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
      route: '',
      minPrice: '',
      maxPrice: ''
    });
    // Clear URL parameters while maintaining browser history
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
    if (window.confirm('Are you sure you want to delete this pricing item?')) {
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
    }
  };

  const handleLogoutClick = () => {
    // Show confirmation dialog before logout
    if (window.confirm('Are you sure you want to logout?')) {
      // Use AuthContext logout function and then navigate
      logout();
      navigate('/');
    }
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
      <div style={{ marginTop: '80px', padding: '2rem' }}>
        {/* Filter Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px'
          }}>Filter Pricing</h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'end'
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{
                fontWeight: '600',
                color: '#555',
                marginBottom: '8px',
                display: 'block'
              }}>Ship Name</label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                value={filters.shipName}
                onChange={(e) => handleFilterChange('shipName', e.target.value)}
              >
                <option value="">All Ships</option>
                {availableShips.map(ship => (
                  <option key={ship} value={ship}>{ship}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{
                fontWeight: '600',
                color: '#555',
                marginBottom: '8px',
                display: 'block'
              }}>Route</label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                value={filters.route}
                onChange={(e) => handleFilterChange('route', e.target.value)}
              >
                <option value="">All Routes</option>
                {availableRoutes.map(route => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{
                fontWeight: '600',
                color: '#555',
                marginBottom: '8px',
                display: 'block'
              }}>Min Price</label>
              <input
                type="number"
                placeholder="Min Price"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{
                fontWeight: '600',
                color: '#555',
                marginBottom: '8px',
                display: 'block'
              }}>Max Price</label>
              <input
                type="number"
                placeholder="Max Price"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'end' }}>
              <Button 
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  color: 'white'
                }}
                onClick={applyFilters}
              >
                Filter
              </Button>
              <Button 
                style={{
                  background: '#6c757d',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  color: 'white'
                }}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
        
        <h2>Dynamic Cabin Type Pricing</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button variant="success" className="mb-3" onClick={() => {
          setEditItem(null);
          resetModalState();
          setShowModal(true);
        }}>
          Add Pricing
        </Button>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Ship Name</th>
                <th>Route</th>
                <th>Interior</th>
                <th>Ocean View</th>
                <th>Balcony</th>
                <th>Suite</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPricing.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.ship_name}</td>
                  <td>{item.route}</td>
                  <td>{item.interior_price}</td>
                  <td>{item.ocean_view_price}</td>
                  <td>{item.balcony_price}</td>
                  <td>{item.suite_price}</td>
                  <td>
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
