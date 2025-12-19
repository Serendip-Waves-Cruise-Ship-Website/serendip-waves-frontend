import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaSwimmingPool, FaDownload, FaFilter, FaArrowLeft, FaSignOutAlt, FaUsers, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import { useToast } from './hooks/useToast';
import logo from './assets/logo.png';
import './FacilitiesDashboard.css';

function FacilitiesDashboard() {
  const navigate = useNavigate();
  const { showConfirm } = useToast();
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    passengerName: '',
    bookingId: '',
    facility: '',
    status: ''
  });

  // Determine the back navigation based on URL params or referrer
  const getBackNavigation = () => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    
    if (from) {
      return `/${from}`;
    }
    
    // Check referrer as fallback
    const referrer = document.referrer;
    if (referrer.includes('/super-admin')) {
      return '/super-admin';
    } else if (referrer.includes('/admin-dashboard')) {
      return '/admin-dashboard';
    }
    
    // Default fallback
    return '/super-admin';
  };

  const handleLogout = () => {
    showConfirm('Are you sure you want to logout?', () => {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      sessionStorage.clear();
      
      navigate('/');
      navigate('/login');
    });
  };

  useEffect(() => {
    fetchFacilitiesData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = facilitiesData;

    if (filters.passengerName) {
      filtered = filtered.filter(item => 
        item.passengerName.toLowerCase().includes(filters.passengerName.toLowerCase())
      );
    }

    if (filters.bookingId) {
      filtered = filtered.filter(item => 
        item.bookingId.toLowerCase().includes(filters.bookingId.toLowerCase())
      );
    }

    if (filters.facility) {
      filtered = filtered.filter(item => 
        item.facilities.some(facility => 
          facility.toLowerCase().includes(filters.facility.toLowerCase())
        )
      );
    }

    if (filters.status) {
      filtered = filtered.filter(item => 
        item.status === filters.status
      );
    }

    setFilteredData(filtered);
  }, [facilitiesData, filters]);

  // Calculate summary statistics
  const totalBookings = filteredData.length;
  const totalRevenue = filteredData.filter(item => item.status === 'paid').reduce((sum, item) => sum + parseFloat(item.totalCost || 0), 0);
  const paidBookings = filteredData.filter(item => item.status === 'paid').length;

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchFacilitiesData = async () => {
    try {
      const response = await fetch('http://localhost/Project-I/backend/getAllFacilityPreferences.php');
      const data = await response.json();
      
      if (data.success && data.preferences) {
        // Transform the data to match expected structure
        const transformedData = data.preferences.map((pref, index) => {
          const facilities = [];
          
          // Use facility_details from API response if available
          if (pref.facility_details && Array.isArray(pref.facility_details)) {
            pref.facility_details.forEach(facility => {
              facilities.push({
                name: facility.name,
                quantity: facility.unit_price === 0 ? 'Free Access' : `${facility.quantity} ${facility.unit === 'hour' ? 'hours' : facility.unit === 'event' ? 'events' : 'days'}`,
                cost: facility.total_price || 0
              });
            });
          } else {
            // Fallback to manual mapping if facility_details not available
            const selectedFacilities = pref.selected_facilities || {};
            const quantities = pref.quantities || {};
            
            // Updated facility mapping to match API codes
            const facilityInfo = {
              'spa_and_wellness_center': { name: 'Spa and Wellness Center', price: 50 },
              'water_sports_pass': { name: 'Water Sports Pass', price: 30 },
              'casino_entry_pass': { name: 'Casino Entry Pass', price: 25 },
              'babysitting_services': { name: 'Babysitting Services', price: 20 },
              'private_partyevent_hall': { name: 'Private Party/Event Hall', price: 200 },
              'translator_support': { name: 'Translator Support', price: 50 },
              'fitness_center': { name: 'Fitness Center', price: 0 },
              'cinema_and_openair_movies': { name: 'Cinema & Open-Air Movies', price: 15 },
              'kids_club_and_play_area': { name: "Kids' Club & Play Area", price: 0 }
            };
            
            Object.keys(selectedFacilities).forEach(facilityId => {
              if (selectedFacilities[facilityId] && facilityInfo[facilityId]) {
                const quantity = quantities[facilityId] || 1;
                const unitPrice = facilityInfo[facilityId].price;
                facilities.push({
                  name: facilityInfo[facilityId].name,
                  quantity: facilityInfo[facilityId].price === 0 ? 'Free Access' : `${quantity} ${facilityId.includes('hour') ? 'hours' : facilityId.includes('event') ? 'events' : 'days'}`,
                  cost: unitPrice * quantity
                });
              }
            });
          }
          
          return {
            id: index + 1,
            passengerName: pref.passenger_name || 'Unknown',
            bookingId: pref.booking_id,
            facilities: facilities,
            totalCost: pref.total_cost || 0,
            paymentStatus: pref.payment_status || 'pending',
            status: pref.status || 'pending'
          };
        });
        setFacilitiesData(transformedData);
      } else {
        setFacilitiesData([]);
      }
    } catch (error) {
      console.error('Failed to fetch facilities data:', error);
      setFacilitiesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'Pending' },
      'paid': { bg: 'success', text: 'Paid' },
      'cancelled': { bg: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: 'Unknown' };
    return (
      <Badge bg={config.bg}>
        {config.text}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Passenger Name', 'Booking ID', 'Facilities', 'Quantities', 'Individual Costs', 'Status', 'Total Cost'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.passengerName,
        item.bookingId,
        item.facilities.map(f => f.name).join('; '),
        item.facilities.map(f => f.quantity).join('; '),
        item.facilities.map(f => `$${f.cost}`).join('; '),
        item.status,
        item.totalCost
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'facility-preferences.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading facilities data...</div>;
  }

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
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ width: '100%', position: 'fixed', top: 0, zIndex: 1030 }}>
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Logo" width="40" height="40" className="me-3" />
            <span className="navbar-brand mb-0 h1 fw-bold text-dark">Facilities Dashboard</span>
          </div>
          
          {/* Right side - Logout button */}
          <div className="d-flex align-items-center">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center rounded-pill px-3"
              style={{
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                fontWeight: '500'
              }}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div style={{ marginTop: '110px', width: '100%' }}>
        {/* Gradient Header */}
        <section className="facilities-hero-section mb-4" style={{ minHeight: '220px', padding: '40px 0' }}>
          <div className="facilities-hero-content container text-center text-white">
            <h2 className="facilities-hero-title mb-2" style={{ fontSize: '2.8rem' }}>
              <FaSwimmingPool className="me-2 mb-1" /> Facilities Dashboard
            </h2>
            <p className="facilities-hero-subtitle mb-0">
              Monitor and manage all facility bookings with powerful filters and detailed insights.
            </p>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="container mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px' }}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Bookings</p>
                      <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{totalBookings}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                      <FaUsers style={{ fontSize: '1.8rem' }} />
                    </div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Facility reservations</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px' }}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Revenue</p>
                      <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>${totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                      <FaDollarSign style={{ fontSize: '1.8rem' }} />
                    </div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>From paid bookings</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px' }}>
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Paid Bookings</p>
                      <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{paidBookings}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                      <FaCheckCircle style={{ fontSize: '1.8rem' }} />
                    </div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Confirmed payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card booking-glass-effect mb-4 p-3 shadow-lg border-0" style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: '15px' }}>
          {/* Filters */}
          <div className="mb-4">
            <h5 className="mb-3">
              <FaFilter className="me-2" />
              Filters
            </h5>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Passenger Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name..."
                    value={filters.passengerName}
                    onChange={(e) => handleFilterChange('passengerName', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Booking ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by booking ID..."
                    value={filters.bookingId}
                    onChange={(e) => handleFilterChange('bookingId', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Facility</Form.Label>
                  <Form.Select
                    value={filters.facility}
                    onChange={(e) => handleFilterChange('facility', e.target.value)}
                  >
                    <option value="">All Facilities</option>
                    <option value="Spa and Wellness Center">Spa and Wellness Center</option>
                    <option value="Private Party/Event Hall">Private Party/Event Hall</option>
                    <option value="Babysitting Services">Babysitting Services</option>
                    <option value="Fitness Center">Fitness Center</option>
                    <option value="Cinema/Open Air">Cinema/Open Air</option>
                    <option value="Game Zone/Arcade">Game Zone/Arcade</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Data Table */}
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                  <tr>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Passenger Name</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Booking ID</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Facilities</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>
                        <div style={{ fontSize: '1.1rem' }}>
                          <FaSwimmingPool style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                          <p className="mb-0">No facility preferences found</p>
                          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '14px 12px', fontWeight: '500' }}>{item.passengerName}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ background: '#e7f0ff', color: '#667eea', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            #{item.bookingId}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div>
                            {item.facilities.map((facility, idx) => (
                              <div key={idx} className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px', marginBottom: idx !== item.facilities.length - 1 ? '8px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    background: facility.cost === 0 ? '#d4f4dd' : '#e7f0ff',
                                    color: facility.cost === 0 ? '#1e7e34' : '#667eea',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                  }}>
                                    {facility.name}
                                  </span>
                                  <span style={{ background: '#fff', color: '#666', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500', border: '1px solid #e0e0e0' }}>
                                    Qty: {facility.quantity}
                                  </span>
                                </div>
                                <div>
                                  {facility.cost === 0 ? (
                                    <span style={{ background: '#d4f4dd', color: '#1e7e34', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>FREE</span>
                                  ) : (
                                    <span style={{ fontWeight: '600', color: '#1e7e34' }}>${facility.cost}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          {getStatusBadge(item.status)}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e7e34' }}>${item.totalCost}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                              {item.facilities.length} facility{item.facilities.length !== 1 ? 'ies' : ''}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacilitiesDashboard;