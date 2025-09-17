import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Row, Col, Table, Card, Alert } from 'react-bootstrap';
import { FaSwimmingPool, FaCheckCircle, FaCreditCard, FaSave, FaArrowLeft } from 'react-icons/fa';
import logo from './assets/logo.png';
import BookedFacilities from './components/BookedFacilities';
import FacilityBookingConfirmation from './components/FacilityBookingConfirmation';
import './FacilitiesPreferencePage.css';

function FacilitiesPreferencePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  console.log('FacilitiesPreferencePage rendered, bookingId:', bookingId);
  
  const [passenger, setPassenger] = useState(null);
  const [facilities, setFacilities] = useState({});
  const [selectedFacilities, setSelectedFacilities] = useState({});
  const [quantities, setQuantities] = useState({});
  const [_loading, _setLoading] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [refreshBookedFacilities, setRefreshBookedFacilities] = useState(0);
  const [existingBookingStatus, setExistingBookingStatus] = useState(null); // Track if booking is paid
  const [paidFacilities, setPaidFacilities] = useState(new Set()); // Track facilities already paid for
  const [pendingAmount, setPendingAmount] = useState(0); // Track pending amount

  // Fetch facilities from backend
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setFacilitiesLoading(true);
        const response = await fetch('http://localhost/Project-I/backend/getFacilities.php');
        const data = await response.json();
        
        if (data.success) {
          setFacilities(data.facilitiesMap);
        } else {
          setError('Failed to load facilities data.');
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setError('Failed to load facilities data.');
      } finally {
        setFacilitiesLoading(false);
      }
    };
    
    fetchFacilities();
  }, []);

  useEffect(() => {
    // Fetch passenger data based on booking ID
    const fetchPassengerData = async () => {
      try {
        console.log('Fetching passenger data for bookingId:', bookingId);
        
        // Replace with actual API endpoint for real bookings
        const apiUrl = `http://localhost/Project-I/backend/getPassengerByBooking.php?booking_id=${bookingId}`;
        console.log('Making API call to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('API response:', data);
        
        if (data.success && data.passenger) {
          console.log('Setting passenger data:', data.passenger);
          console.log('Passenger name field:', data.passenger.passenger_name);
          setPassenger(data.passenger);
        } else {
          console.log('No passenger found for booking ID:', bookingId);
          setError(`Booking ID ${bookingId} not found in the system.`);
        }
      } catch (error) {
        console.error('Error fetching passenger data:', error);
        
        // Provide error messaging based on the type of error
        let errorMessage = 'Unable to load passenger data. Please check your booking ID and try again.';
        if (error.message.includes('401')) {
          errorMessage = 'Authentication required. Please login and try again.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Booking not found. Please verify your booking ID.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        setError(errorMessage);
      }
    };
    
    fetchPassengerData();
  }, [bookingId]);

  // Function to fetch existing facility bookings to identify paid facilities and pending amounts
  const fetchExistingBookings = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost/Project-I/backend/getCustomerFacilityPreferences.php?booking_id=${bookingId}`);
      const data = await response.json();
      
      if (data.success && data.preference) {
        const preference = data.preference;
        
        // Track pending amount
        setPendingAmount(preference.pending_amount || 0);
        
        // Collect paid facilities
        const paidFacilitySet = new Set();
        
        if (preference.facility_details) {
          console.log('🔍 Processing facility details:', preference.facility_details);
          preference.facility_details.forEach(facility => {
            console.log(`📊 Facility: "${facility.name}" - Payment Status: ${facility.payment_status}`);
            if (facility.payment_status === 'paid') {
              // Convert facility name back to facility code for comparison
              const facilityCode = convertFacilityNameToCode(facility.name);
              console.log(`🔄 Mapping "${facility.name}" → "${facilityCode}"`);
              if (facilityCode) {
                paidFacilitySet.add(facilityCode);
                console.log(`✅ Added to paid facilities: ${facilityCode}`);
              } else {
                console.error(`❌ Failed to map facility name: "${facility.name}"`);
              }
            }
          });
        }
        
        setPaidFacilities(paidFacilitySet);
        console.log('🎯 Final paid facilities set:', Array.from(paidFacilitySet));
      }
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
      // Non-blocking error - just continue with empty paid facilities
    }
  }, [bookingId]);

  // Fetch existing facility bookings on component mount and when booking updates
  useEffect(() => {
    if (bookingId) {
      fetchExistingBookings();
    }
  }, [bookingId, refreshBookedFacilities, fetchExistingBookings]);

  // Helper function to convert facility name back to facility code
  const convertFacilityNameToCode = (facilityName) => {
    // Map ALL facility names from database to their codes
    const nameToCodeMap = {
      // Current active facilities from database (updated with complete mapping)
      'Spa and Wellness Center': 'spa_and_wellness_center',
      'Water Sports Adventure': 'water_sports_adventure',
      'Casino Entry Pass': 'casino_entry_pass',
      'Babysitting Services': 'babysitting_services',
      'Private Partyevent Hall': 'private_partyevent_hall',
      'Translator Support': 'translator_support',
      'Fitness Center': 'fitness_center',
      'Cinema & Open-Air Movies': 'cinema_and_openair_movies',
      'Kids\' Club & Play Area': 'kids_club_and_play_area',
      'swimming': 'swimming',
      'dance': 'dance',
      'Swimming Pool': 'swimming_pool',
      'Casino Gaming': 'casino_gaming',
      'Gymnasium': 'gymnasium',
      'Fine Dining Restaurant': 'fine_dining_restaurant',
      'Cocktail Bar': 'cocktail_bar',
      'Library': 'library',
      'Theater': 'theater',
      'Mini Golf': 'mini_golf',
      'duty free shopping': 'duty_free_shopping',
      
      // Legacy mappings for backward compatibility
      'Private Party/Event Hall': 'private_partyevent_hall',
      'Multilingual Support & Translation': 'translator_support',
      'WiFi Access': 'wifi',
      'Room Service': 'room_service',
      'Laundry Service': 'laundry_service',
      'Specialty Dining': 'specialty_dining',
      'Private Cabana Rental': 'private_cabana_rental',
      'Spa Access': 'spa_access'
    };
    
    const code = nameToCodeMap[facilityName];
    if (!code) {
      console.warn(`⚠️  No facility code mapping found for: "${facilityName}"`);
    }
    return code || null;
  };

  // Validation functions
  const getMaxQuantityForFacility = (facilityId) => {
    if (!passenger || !passenger.trip_duration || passenger.trip_duration <= 0) {
      // Fallback to reasonable defaults if trip duration is not available
      const facility = facilities[facilityId];
      if (facility?.unit === 'day') return 7; // Default max 7 days
      if (facility?.unit === 'hour') return 24; // Default max 24 hours 
      return 1;
    }
    
    const facility = facilities[facilityId];
    
    // For day-based facilities, maximum should be trip duration
    if (facility?.unit === 'day') {
      return passenger.trip_duration;
    }
    
    // For event/booking/access based facilities, no day restriction
    if (facility?.unit === 'event' || facility?.unit === 'booking' || facility?.unit === 'access') {
      return 1;
    }
    
    // For hour-based facilities (like babysitting), reasonable limit per day
    if (facility?.unit === 'hour') {
      return passenger.trip_duration * 12; // Max 12 hours per day
    }
    
    return 1;
  };

  const _validateQuantity = (facilityId, quantity) => {
    const maxQuantity = getMaxQuantityForFacility(facilityId);
    const facility = facilities[facilityId];
    
    if (quantity > maxQuantity) {
      if (facility?.unit === 'day' && passenger && passenger.trip_duration) {
        return `Maximum ${maxQuantity} day${maxQuantity > 1 ? 's' : ''} allowed for your ${passenger.trip_duration}-day trip`;
      } else if (facility?.unit === 'hour' && passenger && passenger.trip_duration) {
        return `Maximum ${maxQuantity} hours allowed for your ${passenger.trip_duration}-day trip`;
      }
      return `Maximum ${maxQuantity} ${facility?.unit}${maxQuantity > 1 ? 's' : ''} allowed`;
    }
    
    return null;
  };

  const handleFacilityChange = (facilityId) => {
    // Check if journey is completed
    if (passenger && passenger.journey_completed) {
      setError('Cannot book facilities for completed journeys.');
      return;
    }

    // Check if facility is already paid for
    if (paidFacilities.has(facilityId)) {
      const facilityName = facilities[facilityId]?.name || 'this facility';
      alert(`You have already paid for "${facilityName}". Paid facilities cannot be booked again.`);
      return;
    }

    // Check if there are pending amounts
    if (pendingAmount > 0) {
      alert(`You have pending facility bookings totaling $${pendingAmount.toFixed(2)}. Please complete payment for existing bookings before adding new facilities.`);
      return;
    }

    setSelectedFacilities(prev => ({
      ...prev,
      [facilityId]: !prev[facilityId]
    }));
    
    // Set default quantity when selecting a facility
    if (!selectedFacilities[facilityId]) {
      const facility = facilities[facilityId];
      const defaultQuantity = facility.unit === 'event' || facility.unit === 'booking' || facility.unit === 'access' ? 1 : 1;
      setQuantities(prev => ({
        ...prev,
        [facilityId]: defaultQuantity
      }));
    }
  };

  // Generate dropdown options with smart defaults
  const generateQuantityOptions = (facilityId) => {
    const facility = facilities[facilityId];
    const tripDuration = passenger?.trip_duration || 1;
    
    // For free facilities (access-based), just show 1 option
    if (facility.price === 0) {
      return [{ value: 1, label: 'Free Access' }];
    }
    
    // For paid facilities, show day options based on trip duration
    if (facility.price > 0) {
      return Array.from({ length: tripDuration }, (_, i) => i + 1).map(num => {
        const totalCost = facility.price * num;
        return {
          value: num,
          label: `${num} day${num > 1 ? 's' : ''} - $${totalCost.toFixed(2)}`
        };
      });
    }
    
    // Fallback for other types
    return [{ value: 1, label: '1 unit' }];
  };

  const handleQuantityChange = (facilityId, quantity) => {
    const parsedQuantity = parseInt(quantity) || 1;
    
    setQuantities(prev => ({
      ...prev,
      [facilityId]: parsedQuantity
    }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedFacilities)
      .filter(([, selected]) => selected)
      .reduce((total, [facilityId]) => {
        const facility = facilities[facilityId];
        const quantity = quantities[facilityId] || 1;
        
        // Each quantity represents days for paid facilities, direct cost calculation
        return total + (facility?.price * quantity || 0);
      }, 0);
  };

  const getCostBreakdown = () => {
    return Object.entries(selectedFacilities)
      .filter(([, selected]) => selected)
      .map(([facilityId]) => {
        const facility = facilities[facilityId];
        const quantity = quantities[facilityId] || 1;
        
        let quantityText = '';
        let subtotal = 0;
        
        if (facility.price === 0) {
          quantityText = 'Free Access';
          subtotal = 0;
        } else {
          quantityText = `${quantity} day${quantity > 1 ? 's' : ''}`;
          subtotal = facility.price * quantity;
        }
        
        return {
          item: facility.name,
          quantity: quantityText,
          unitPrice: facility.price,
          subtotal
        };
      });
  };

  const handleSavePreferences = () => {
    // Validate if any facilities are selected
    const hasSelectedFacilities = Object.values(selectedFacilities).some(selected => selected);
    
    if (!hasSelectedFacilities) {
      setError('Please select at least one facility before proceeding.');
      return;
    }
    
    // Show booking confirmation dialog
    setShowBookingConfirmation(true);
  };

  const handleBookingComplete = (action, result) => {
    // Handle the result after booking is processed
    if (result.success) {
      // Refresh booked facilities display
      setRefreshBookedFacilities(prev => prev + 1);
      
      // Reset the form and close the modal after successful payment
      setSelectedFacilities({});
      setQuantities({});
      setShowBookingConfirmation(false); // Close the payment popup
      
      switch (action) {
        case 'confirm':
          setSuccess('🎉 Payment confirmed! Facilities booked successfully. You can add more facilities below if needed.');
          break;
        case 'save_pending':
          setSuccess('💾 Preferences saved! You can complete payment later or add more facilities below.');
          break;
        case 'cancel':
          setSuccess('❌ Booking cancelled.');
          break;
      }
    } else {
      setError('Failed to process booking: ' + result.message);
    }
  };

  const goToMeals = () => {
    navigate(`/meals/${bookingId}`);
  };

  if (!passenger) {
    console.log('Passenger data not loaded yet, showing loading...');
    return (
      <div className="facilities-preference-page">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container-fluid px-4">

            {/* Logo */}
            <div className="d-flex align-items-center">
              <img 
                src={logo} 
                alt="Logo" 
                width="80" 
                height="80" 
                className="me-3" 
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
              />
            </div>

            {/* Navigation Menu */}
            <div className="navbar-nav d-flex flex-row">
              <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/destinations" onClick={(e) => { e.preventDefault(); navigate('/destinations'); }}>Destination</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/things-to-do" onClick={(e) => { e.preventDefault(); navigate('/things-to-do'); }}>Facilities</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/our-dining" onClick={(e) => { e.preventDefault(); navigate('/our-dining'); }}>Our Dining</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/cruise-ships" onClick={(e) => { e.preventDefault(); navigate('/cruise-ships'); }}>Cruises</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('about'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>About Us</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Contact</a>
            </div>

            {/* Right side - Booking ID only */}

       //     <div className="d-flex align-items-center">
         //     <img src={logo} alt="Logo" width="40" height="40" className="me-3" />
        //      <span className="navbar-brand mb-0 h1 fw-bold text-dark">Facility Preferences</span>
        //    </div>

            <div className="d-flex align-items-center">
              <span className="text-muted">Booking ID: {bookingId}</span>
            </div>
          </div>
        </nav>

        <div className="container py-4">
          <div className="text-center mt-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading passenger data for booking {bookingId}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (facilitiesLoading) {
    return (
      <div className="facilities-preference-page">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container-fluid px-4">

            {/* Logo */}
            <div className="d-flex align-items-center">
              <img 
                src={logo} 
                alt="Logo" 
                width="80" 
                height="80" 
                className="me-3" 
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
              />
            </div>

            {/* Navigation Menu */}
            <div className="navbar-nav d-flex flex-row">
              <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/destinations" onClick={(e) => { e.preventDefault(); navigate('/destinations'); }}>Destination</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/things-to-do" onClick={(e) => { e.preventDefault(); navigate('/things-to-do'); }}>Facilities</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/our-dining" onClick={(e) => { e.preventDefault(); navigate('/our-dining'); }}>Our Dining</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/cruise-ships" onClick={(e) => { e.preventDefault(); navigate('/cruise-ships'); }}>Cruises</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('about'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>About Us</a>
              <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Contact</a>
            </div>

            {/* Right side - Booking ID only */}

       //     <div className="d-flex align-items-center">
       //       <img src={logo} alt="Logo" width="40" height="40" className="me-3" />
         //     <span className="navbar-brand mb-0 h1 fw-bold text-dark">Facility Preferences</span>
        //    </div>

            <div className="d-flex align-items-center">
              <span className="text-muted">Booking ID: {bookingId}</span>
            </div>
          </div>
        </nav>

        <div className="container py-4">
          <div className="text-center mt-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading facilities data...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasSelectedFacilities = Object.values(selectedFacilities).some(selected => selected);

  return (
    <div className="facilities-preference-page">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">

          {/* Logo */}
          <div className="d-flex align-items-center">
            <img 
              src={logo} 
              alt="Logo" 
              width="80" 
              height="80" 
              className="me-3" 
              style={{ cursor: 'pointer' }}
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
            />
          </div>

          {/* Navigation Menu */}
          <div className="navbar-nav d-flex flex-row">
            <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
            <a className="nav-link px-3 fw-medium text-dark" href="/destinations" onClick={(e) => { e.preventDefault(); navigate('/destinations'); }}>Destination</a>
            <a className="nav-link px-3 fw-medium text-dark" href="/things-to-do" onClick={(e) => { e.preventDefault(); navigate('/things-to-do'); }}>Facilities</a>
            <a className="nav-link px-3 fw-medium text-dark" href="/our-dining" onClick={(e) => { e.preventDefault(); navigate('/our-dining'); }}>Our Dining</a>
            <a className="nav-link px-3 fw-medium text-dark" href="/cruise-ships" onClick={(e) => { e.preventDefault(); navigate('/cruise-ships'); }}>Cruises</a>
            <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('about'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>About Us</a>
            <a className="nav-link px-3 fw-medium text-dark" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Contact</a>
          </div>

          {/* Right side - Booking ID only */}
          <div className="d-flex align-items-center">
            <span className="text-muted">Booking ID: {bookingId}</span>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <Card className="shadow-lg">
          <Card.Header className="bg-info text-white">
            <div className="d-flex justify-content-center align-items-center">
              <h2 className="mb-0">
                <FaSwimmingPool className="me-2" />
                Facility Preferences for {passenger.passenger_name || 'Guest'}
              </h2>
            </div>
            {passenger.departure_date && passenger.return_date && (
              <div className="mt-2">
                <small>
                  Trip: {new Date(passenger.departure_date).toLocaleDateString()} - {new Date(passenger.return_date).toLocaleDateString()} 
                  ({passenger.trip_duration} day{passenger.trip_duration > 1 ? 's' : ''})
                </small>
              </div>
            )}
          </Card.Header>
          
          <Card.Body>
            {/* Show Booked Facilities First */}
            <BookedFacilities 
              bookingId={bookingId} 
              key={refreshBookedFacilities} 
              onBookingUpdate={(action, data) => {
                if (action === 'cancelled') {
                  setSuccess('❌ Booking cancelled successfully!');
                  // Reset form to allow new booking
                  setSelectedFacilities({});
                  setQuantities({});
                  setExistingBookingStatus(null);
                  // Refresh paid facilities list
                  fetchExistingBookings();
                } else if (action === 'payment_completed') {
                  setSuccess('✅ Payment completed successfully! Your facilities are now confirmed. You can add more facilities below if needed.');
                  // Update status to paid but don't redirect - let user add more facilities
                  setExistingBookingStatus('paid');
                  // Reset the current selection form
                  setSelectedFacilities({});
                  setQuantities({});
                  // Refresh the booked facilities display
                  setRefreshBookedFacilities(prev => prev + 1);
                  // IMPORTANT: Refresh paid facilities list to block newly paid facilities
                  fetchExistingBookings();
                } else if (action === 'status_loaded' && data) {
                  // Track the payment status to determine if booking is read-only
                  setExistingBookingStatus(data.payment_status);
                }
              }}
            />
            
            {passenger.journey_completed && (
              <Alert variant="warning" className="d-flex align-items-center mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <div>
                  <strong>Journey Completed:</strong> This trip has already ended on {new Date(passenger.return_date).toLocaleDateString()}. 
                  Facility bookings are not available for completed journeys.
                </div>
              </Alert>
            )}
            
            {error && (
              <Alert variant="danger" className="d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <div>{error}</div>
              </Alert>
            )}
            {success && <Alert variant="success">{success}</Alert>}
            
            {/* Show info message if user has existing paid booking */}
            {existingBookingStatus === 'paid' && (
              <Alert variant="info" className="mb-3">
                <FaCheckCircle className="me-2" />
                <strong>Previous Booking Confirmed:</strong> You have confirmed facilities above. You can add more facilities below if needed.
              </Alert>
            )}
            
            {/* Facility selection form - always show unless journey is completed */}
            <div className="facilities-selection">
              <div className="facilities-grid-container">
                {Object.entries(facilities).map(([facilityId, facility]) => (
                  <div 
                    key={facilityId} 
                    className={`facility-card-compact ${paidFacilities.has(facilityId) ? 'facility-paid' : ''} ${pendingAmount > 0 && !paidFacilities.has(facilityId) ? 'facility-blocked' : ''}`}
                    onClick={(e) => {
                      if (paidFacilities.has(facilityId)) {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(`🚫 "${facility.name}" is already paid for and cannot be modified. This facility has been confirmed for your booking.`);
                      }
                    }}
                  >
                    <div className="facility-card-header">
                      <Form.Check 
                        type="checkbox"
                        id={facilityId}
                        checked={selectedFacilities[facilityId] || false}
                        onChange={() => handleFacilityChange(facilityId)}
                        className="facility-checkbox"
                        disabled={passenger.journey_completed || paidFacilities.has(facilityId) || pendingAmount > 0}
                        onClick={(e) => {
                          if (paidFacilities.has(facilityId)) {
                            e.preventDefault();
                            alert(`You have already paid for "${facility.name}". Paid facilities cannot be booked again.`);
                          } else if (pendingAmount > 0) {
                            e.preventDefault();
                            alert(`You have pending facility bookings totaling $${pendingAmount.toFixed(2)}. Please complete payment for existing bookings before adding new facilities.`);
                          }
                        }}
                      />
                    </div>
                    <div className="facility-card-content">
                      <h6 className="facility-name">{facility.name}</h6>
                      <p className="facility-price">
                        {facility.unitText}
                      </p>
                      
                      {/* Status indicators */}
                      {paidFacilities.has(facilityId) && (
                        <div className="facility-status-badge paid">
                          <i className="fas fa-check-circle me-1"></i>
                          Already Paid
                        </div>
                      )}
                      {pendingAmount > 0 && !paidFacilities.has(facilityId) && (
                        <div className="facility-status-badge blocked">
                          <i className="fas fa-lock me-1"></i>
                          Complete pending payment first
                        </div>
                      )}
                      
                      {selectedFacilities[facilityId] && facility.price > 0 && (
                        <div className="quantity-section">
                          <Form.Label className="quantity-label">
                            Days to use:
                          </Form.Label>
                          <Form.Select 
                            value={quantities[facilityId] || 1}
                            onChange={(e) => handleQuantityChange(facilityId, e.target.value)}
                            className="quantity-input"
                            disabled={passenger.journey_completed}
                            size="sm"
                          >
                            {generateQuantityOptions(facilityId).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                          <small className="text-muted">
                            <i className="fas fa-calendar-alt me-1"></i>
                            Trip: {passenger.trip_duration} day{passenger.trip_duration > 1 ? 's' : ''} total
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {hasSelectedFacilities && (
              <div className="cost-summary-section">
                <Card className="cost-summary-card">
                  <Card.Header className="cost-summary-header">
                    <h5 className="mb-0">Cost Summary</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive className="cost-breakdown-table mb-0">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCostBreakdown().map((item, index) => (
                          <tr key={index}>
                            <td className="item-name">{item.item}</td>
                            <td className="quantity-cell">{item.quantity}</td>
                            <td className="price-cell">${item.unitPrice}</td>
                            <td className="subtotal-cell">${item.subtotal}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td colSpan="3" className="total-label"><strong>Total</strong></td>
                          <td className="total-amount"><strong>${calculateTotal()}</strong></td>
                        </tr>
                      </tfoot>
                    </Table>
                  </Card.Body>
                </Card>
              </div>
            )}
            
            <div className="action-buttons-section">
              <div className="action-buttons d-flex gap-3 flex-wrap justify-content-center">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleSavePreferences}
                  disabled={!hasSelectedFacilities || passenger.journey_completed}
                  className="pay-now-btn"
                >
                  <FaCreditCard className="me-2" />
                  {existingBookingStatus === 'paid' ? 'Book Additional Facilities' : 'Book Facilities'} (${calculateTotal()})
                </Button>
                
                <Button 
                  variant="info" 
                  size="lg"
                  onClick={handleSavePreferences}
                  disabled={!hasSelectedFacilities || passenger.journey_completed}
                  className="save-later-btn"
                >
                  <FaSave className="me-2" />
                  Review & Book
                </Button>
                
                <Button 
                  variant="warning" 
                  size="lg"
                  onClick={goToMeals}
                  className="back-meals-btn"
                >
                  <FaArrowLeft className="me-2" />
                  Back to Meal Preferences
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => navigate('/customer-dashboard')}
                  className="back-history-btn"
                >
                  Back to Booking History
                </Button>
              </div>
            </div>

          </Card.Body>
        </Card>
      </div>

      {/* Facility Booking Confirmation Modal */}
      <FacilityBookingConfirmation
        show={showBookingConfirmation}
        onHide={() => setShowBookingConfirmation(false)}
        bookingId={bookingId}
        passengerEmail={passenger?.email || ''}
        passengerName={passenger?.passenger_name || 'Guest'}
        selectedFacilities={selectedFacilities}
        quantities={quantities}
        facilities={facilities}
        totalCost={calculateTotal()}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}export default FacilitiesPreferencePage;