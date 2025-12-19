import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaShip, FaUser, FaBed, FaCalendarAlt, FaBook, FaDollarSign, FaChartLine } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookingOverviewPage.css';
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';

// Mock cabin types data (keeping this as it's not requested to be dynamic)
const cabinTypes = ['Interior', 'Ocean View', 'Balcony', 'Suite'];

function BookingOverviewPage() {
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = (to) => { window.location.href = to; };
  const [bookings, setBookings] = useState([]);
  const [cruiseTitles, setCruiseTitles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    cruise: '',
    cabinType: '',
    dateFrom: '',
    dateTo: '',
  });

  // Fetch bookings and cruise titles from backend on mount
  useEffect(() => {
    // Fetch bookings
    fetch('http://localhost/Project-I/backend/getAllBookings.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.bookings) {
          setBookings(data.bookings);
        }
      });

    // Fetch cruise titles from ship_details table
    fetch('http://localhost/Project-I/backend/getCruises.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cruises) {
          setCruiseTitles(data.cruises);
        }
      })
      .catch(error => {
        console.error('Error fetching cruise titles:', error);
        // Fallback to empty array if API fails
        setCruiseTitles([]);
      });
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      String(b.booking_id).toLowerCase().includes(filters.search.toLowerCase()));
    const matchesCruise = !filters.cruise || b.ship_name === filters.cruise;
    const matchesCabinType = !filters.cabinType || b.room_type === filters.cabinType;
    const matchesDateFrom = !filters.dateFrom || (b.booking_date && b.booking_date >= filters.dateFrom);
    const matchesDateTo = !filters.dateTo || (b.booking_date && b.booking_date <= filters.dateTo);
    return matchesSearch && matchesCruise && matchesCabinType && matchesDateFrom && matchesDateTo;
  });

  // Calculate summary statistics
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Handle filter changes
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const clearFilters = () => {
    setFilters({ search: '', cruise: '', cabinType: '', dateFrom: '', dateTo: '' });
  };

  // Delete booking
  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost/Project-I/backend/deleteBooking.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_id: bookingId })
        });

        const data = await response.json();
        
        if (data.success) {
          // Remove the booking from the local state
          setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
          // Show success message (optional)
          alert('Booking deleted successfully!');
        } else {
          alert('Failed to delete booking: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Network error occurred while deleting booking. Please try again.');
      }
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
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
          Booking Overview
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
        {/* Gradient Header */}
        <section className="booking-hero-section mb-4" style={{ minHeight: '220px', padding: '40px 0' }}>
          <div className="booking-hero-background"></div>
          <div className="booking-hero-content container text-center text-white">
            <h2 className="booking-hero-title mb-2" style={{ fontSize: '2.8rem' }}>
              <FaShip className="me-2 mb-1" /> Booking Overview
            </h2>
            <p className="booking-hero-subtitle mb-0">
              Monitor and manage all cruise bookings with powerful filters and quick actions.
            </p>
          </div>
        </section>
        
        {/* Summary Cards */}
        <div className="row g-3 mb-4" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px' }}>
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Bookings</p>
                    <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{totalBookings}</h3>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                    <FaBook style={{ fontSize: '1.8rem' }} />
                  </div>
                </div>
                <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Active cruise reservations</p>
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
                <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>From all bookings</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px' }}>
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg Booking Value</p>
                    <h3 className="mb-0" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>${avgBookingValue.toFixed(0).toLocaleString()}</h3>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                    <FaChartLine style={{ fontSize: '1.8rem' }} />
                  </div>
                </div>
                <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Per reservation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section with Add Booking button on the right */}
        <div className="card booking-glass-effect mb-4 p-3 shadow-lg border-0" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-3">
            <div style={{ flex: 1 }}>
              <Row className="g-2 align-items-end">
                <Col md={3}>
                  <Form.Label><FaUser className="me-1" /> Search</Form.Label>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Passenger Name or Booking ID"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </Col>
                <Col md={2}>
                  <Form.Label><FaShip className="me-1" /> Cruise Title</Form.Label>
                  <Form.Select name="cruise" value={filters.cruise} onChange={handleFilterChange}>
                    <option value="">All Cruises</option>
                    {cruiseTitles.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label><FaBed className="me-1" /> Cabin Type</Form.Label>
                  <Form.Select name="cabinType" value={filters.cabinType} onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    {cabinTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label><FaCalendarAlt className="me-1" /> Date From</Form.Label>
                  <Form.Control type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
                </Col>
                <Col md={2}>
                  <Form.Label><FaCalendarAlt className="me-1" /> Date To</Form.Label>
                  <Form.Control type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  <Button variant="secondary" onClick={clearFilters} className="w-100 d-flex justify-content-center align-items-center text-center">Clear</Button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        {/* Booking Table */}
        <div className="card shadow-sm border-0" style={{ maxWidth: 1200, margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
              <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                <tr>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Booking ID</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Passenger Name</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Cruise Title</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Cabin No.</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Cabin Type</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Guests</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Booking Date</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Total Price</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted" style={{ padding: '40px' }}>
                      <div style={{ fontSize: '1.1rem' }}>
                        <FaBook style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                        <p className="mb-0">No bookings found</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b, index) => (
                    <tr key={b.booking_id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ fontWeight: '600', color: '#667eea' }}>#{b.booking_id}</span>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: '500' }}>{b.full_name}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaShip style={{ color: '#667eea', fontSize: '0.9rem' }} />
                          <span>{b.ship_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{ background: '#e7f0ff', color: '#667eea', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                          {b.cabin_number}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ 
                          background: b.room_type === 'Suite' ? '#d4f4dd' : b.room_type === 'Balcony' ? '#fff4e6' : b.room_type === 'Ocean View' ? '#e3f2fd' : '#f5f5f5',
                          color: b.room_type === 'Suite' ? '#1e7e34' : b.room_type === 'Balcony' ? '#e65100' : b.room_type === 'Ocean View' ? '#0277bd' : '#555',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          {b.room_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '500' }}>{b.number_of_guests}</td>
                      <td style={{ padding: '14px 12px', color: '#666' }}>
                        <FaCalendarAlt style={{ marginRight: '6px', fontSize: '0.85rem', color: '#667eea' }} />
                        {b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', color: '#1e7e34', fontSize: '1rem' }}>
                        ${parseFloat(b.total_price || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(b.booking_id)}
                          title="Delete Booking"
                          style={{ borderRadius: '8px', padding: '6px 12px' }}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
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

export default BookingOverviewPage;