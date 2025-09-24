import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Row, Col, Table, Card, Alert } from 'react-bootstrap';
import { FaUtensils, FaArrowRight, FaSave, FaArrowLeft } from 'react-icons/fa';
import logo from './assets/logo.png';
import './MealsPreferencePage.css';

const MAIN_MEAL_TIMES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' }
];

const TEA_TIMES = [
  { id: 'morning_tea', name: 'Morning Teatime' },
  { id: 'evening_tea', name: 'Evening Teatime' }
];

function MealsPreferencePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  console.log('MealsPreferencePage rendered, bookingId:', bookingId);
  
  const [passenger, setPassenger] = useState(null);
  const [mealOptions, setMealOptions] = useState([]);
  const [mealType, setMealType] = useState('');
  const [selectedMainMeals, setSelectedMainMeals] = useState([]);
  const [selectedTeaTimes, setSelectedTeaTimes] = useState([]);
  const [days, setDays] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const [isJourneyCompleted, setIsJourneyCompleted] = useState(false);
  const [tripDuration, setTripDuration] = useState(0);
  const [mealHistory, setMealHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [canOrderAgain, setCanOrderAgain] = useState(false);
  const [isNewOrder, setIsNewOrder] = useState(false);

  // Function to fetch meal order history
  const fetchMealHistory = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost/Project-I/backend/getMealOrderHistory.php?booking_id=${bookingId}`);
      const data = await response.json();
      
      console.log('Meal history response:', data);
      
      if (data.success && data.history) {
        setMealHistory(data.history);
      } else {
        setMealHistory([]);
      }
    } catch (error) {
      console.error('Error fetching meal history:', error);
      setMealHistory([]);
    }
  }, [bookingId]);

  // Function to check for existing meal preferences
  const checkExistingPreferences = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost/Project-I/backend/getMealPreferencesByBooking.php?booking_id=${bookingId}`);
      const data = await response.json();
      
      console.log('Existing preferences check:', data);
      
      if (data.success && data.preferences) {
        setHasExistingPreferences(true);
        setCanOrderAgain(true); // Always allow ordering again if they have previous orders
        
        // Only populate form if we're not in "order again" mode
        if (!showHistory) {
          setMealType(data.preferences.meal_option_id?.toString() || '');
          setSelectedMainMeals(data.preferences.main_meals || []);
          setSelectedTeaTimes(data.preferences.tea_times || []);
          setDays(data.preferences.days || 1);
          setNotes(data.preferences.notes || '');
        }
      } else {
        setHasExistingPreferences(false);
        setCanOrderAgain(false);
      }
    } catch (error) {
      console.error('Error checking existing preferences:', error);
      setHasExistingPreferences(false);
      setCanOrderAgain(false);
    }
  }, [bookingId, showHistory]);

  useEffect(() => {
    // Fetch meal options from the database
    const fetchMealOptions = async () => {
      try {
        // Add cache-busting parameter to ensure fresh data
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost/Project-I/backend/mealOptionsAPI.php?t=${timestamp}`);
        const data = await response.json();
        
        console.log('Meal options API response:', data); // Debug log
        
        if (data.success && data.data) {
          const activeMealOptions = data.data.filter(option => option.status === 'active');
          console.log('Active meal options:', activeMealOptions); // Debug log
          console.log('Total options from API:', data.data.length); // Debug log
          console.log('Active options after filter:', activeMealOptions.length); // Debug log
          setMealOptions(activeMealOptions);
          
          // Set default meal type to first active option
          if (activeMealOptions.length > 0 && !mealType) {
            setMealType(activeMealOptions[0].option_id.toString());
          }
        } else {
          console.log('API response not successful or no data:', data);
        }
      } catch (error) {
        console.error('Error fetching meal options:', error);
      }
    };

    // Check for existing meal preferences
    checkExistingPreferences();

    // Fetch meal order history
    fetchMealHistory();

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
          setPassenger(data.passenger);
          
          // Set trip duration from API response
          const duration = data.passenger.trip_duration || 0;
          setTripDuration(duration);
          
          console.log('Trip duration from API:', data.passenger.trip_duration);
          console.log('Setting trip duration to:', duration);
          
          // Check journey status
          const status = data.passenger.journey_status || 'active';
          setIsJourneyCompleted(status === 'completed');
          
          console.log('Journey status:', status);
          console.log('Trip duration:', data.passenger.trip_duration);
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
    
    fetchMealOptions();
    fetchPassengerData();
    checkExistingPreferences();
    fetchMealHistory();
  }, [bookingId, mealType, checkExistingPreferences, fetchMealHistory]);

  const handleMainMealChange = (mealTimeId) => {
    setSelectedMainMeals(prev => 
      prev.includes(mealTimeId) 
        ? prev.filter(id => id !== mealTimeId)
        : [...prev, mealTimeId]
    );
  };

  const handleTeaTimeChange = (teaTimeId) => {
    setSelectedTeaTimes(prev => 
      prev.includes(teaTimeId) 
        ? prev.filter(id => id !== teaTimeId)
        : [...prev, teaTimeId]
    );
  };

  const handleSavePreferences = async () => {
    // Prevent saving if journey is completed
    if (isJourneyCompleted) {
      setError('Cannot modify meal preferences for completed journeys.');
      return;
    }

    console.log('=== SAVE PREFERENCES DEBUG START ===');
    console.log('Booking ID:', bookingId);
    console.log('Selected meal type:', mealType);
    console.log('Selected main meals:', selectedMainMeals);
    console.log('Selected tea times:', selectedTeaTimes);
    console.log('Days:', days);
    console.log('Notes:', notes);
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validation checks
      if (!mealType) {
        throw new Error('Please select a meal type');
      }
      
      if (selectedMainMeals.length === 0 && selectedTeaTimes.length === 0) {
        throw new Error('Please select at least one main meal or tea time');
      }
      
      const selectedOption = mealOptions.find(option => option.option_id.toString() === mealType);
      console.log('Selected option:', selectedOption);
      
      const payload = {
        booking_id: bookingId,
        meal_option_id: mealType,
        meal_type: selectedOption ? selectedOption.title : '',
        main_meals: selectedMainMeals,
        tea_times: selectedTeaTimes,
        days: days,
        notes: notes
      };
      
      console.log('Payload to send:', payload);
      console.log('API URL:', 'http://localhost/Project-I/backend/saveMealPreferences.php');
      
      const response = await fetch('http://localhost/Project-I/backend/saveMealPreferences.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Invalid response from server. Please check if XAMPP is running and the backend file exists.');
      }
      
      if (data.success) {
        console.log('✅ SUCCESS: Meal preferences saved successfully!');
        setSuccess('New meal order saved successfully!');
        
        // Refresh meal history and existing preferences
        await fetchMealHistory();
        await checkExistingPreferences();
        
        // Reset states after successful save
        setIsNewOrder(false);
        setHasExistingPreferences(true);
        setCanOrderAgain(true);
        
        // Clear form for potential new order
        setMealType('');
        setSelectedMainMeals([]);
        setSelectedTeaTimes([]);
        setDays(1);
        setNotes('');
        
        // Don't navigate away immediately, let user see the new interface
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        console.error('❌ API returned error:', data.message || data.error);
        throw new Error(data.message || data.error || 'Failed to save preferences');
      }
      
    } catch (error) {
      console.error('❌ Error in handleSavePreferences:', error);
      
      // Provide specific error messages
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        setError('Network error: Unable to connect to server. Please check if XAMPP is running.');
      } else if (error.message.includes('JSON') || error.message.includes('Invalid response')) {
        setError('Server error: Invalid response format. Check if the backend file exists and has no syntax errors.');
      } else {
        setError('Error: ' + error.message);
      }
      
      // Remove demo mode fallback - we want to see real errors
    } finally {
      setLoading(false);
      console.log('=== SAVE PREFERENCES DEBUG END ===');
    }
  };

  const goToFacilities = () => {
    navigate(`/facilities/${bookingId}`);
  };

  const viewMyMeals = () => {
    // Toggle showing meal history
    setShowHistory(!showHistory);
  };

  const orderMealsAgain = () => {
    // Reset form to allow new order
    setMealType('');
    setSelectedMainMeals([]);
    setSelectedTeaTimes([]);
    setDays(1);
    setNotes('');
    setSuccess('');
    setError('');
    
    // Set states for new order mode
    setShowHistory(true); // Show history so user can see previous orders
    setCanOrderAgain(true); // Ensure they can still order again
    setIsNewOrder(true); // Mark as new order mode
    setHasExistingPreferences(false); // Reset this to show fresh form labels
  };

  const completeTrip = () => {
    // Navigate to trip completion or thank you page
    navigate(`/customer-dashboard`, { state: { message: 'Thank you for completing your meal and facility preferences!' } });
  };

  if (!passenger) {
    console.log('Passenger data not loaded yet, showing loading...');
    return (
      <div className="meals-preference-page">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container-fluid px-4">

            {/* Logo */}
            <div className="d-flex align-items-center">
              <img 
                src={logo} 
                alt="Logo" 
                width="40" 
                height="40" 
                className="me-2" 
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
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading passenger data for booking {bookingId}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="meals-preference-page">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">

          {/* Logo */}
          <div className="d-flex align-items-center">
            <img 
              src={logo} 
              alt="Logo" 
              width="40" 
              height="40" 
              className="me-2" 
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
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-center align-items-center">
              <h2 className="mb-0">
                <FaUtensils className="me-2" />
                Meal Preferences for {passenger.name}
              </h2>
            </div>
          </Card.Header>
          
          <Card.Body>
            {isJourneyCompleted && (
              <Alert variant="info" className="d-flex align-items-center">
                <i className="fas fa-info-circle me-2"></i>
                <div>
                  <strong>Journey Completed!</strong> This journey has been completed and meal preferences can no longer be modified.
                  <br />
                  <small>You can view your previous meal selections below, but changes are not allowed for completed journeys.</small>
                </div>
              </Alert>
            )}
            
            {hasExistingPreferences && !isJourneyCompleted && (
              <Alert variant="success" className="d-flex align-items-center">
                <i className="fas fa-check-circle me-2"></i>
                <div>
                  <strong>Meal Preferences Found!</strong> You have {mealHistory.length} previous meal order{mealHistory.length > 1 ? 's' : ''}.
                  <br />
                  <small>You can view your meal history, order meals again, or proceed to facility preferences.</small>
                </div>
              </Alert>
            )}
            
            {error && (
              <Alert variant="warning" className="d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <div>
                  <strong>Demo Mode:</strong> {error}
                  <br />
                  <small>This is a fully functional demo. You can test all features!</small>
                </div>
              </Alert>
            )}
            {success && <Alert variant="success">{success}</Alert>}
            
            {/* Debug info - remove in production */}
            {mealOptions.length === 0 && (
              <Alert variant="info">
                <small>Debug: Loading meal options from database... ({mealOptions.length} options loaded)</small>
              </Alert>
            )}
            
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Meal Type</strong>
                      {hasExistingPreferences && !canOrderAgain && !isJourneyCompleted && <span className="text-success ms-2">✓ Saved</span>}
                      {isJourneyCompleted && <span className="text-info ms-2">🔒 Completed Journey</span>}
                      {isNewOrder && <span className="text-primary ms-2">🍽️ New Order</span>}
                    </Form.Label>
                    <Form.Select 
                      value={mealType} 
                      onChange={(e) => setMealType(e.target.value)}
                      disabled={(!isNewOrder && !canOrderAgain && hasExistingPreferences) || isJourneyCompleted}
                    >
                      <option value="">Select a meal type...</option>
                      {mealOptions.length > 0 ? (
                        mealOptions.map((option) => (
                          <option key={option.option_id} value={option.option_id}>
                            {option.title}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading meal options...</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Number of Days</strong>
                      {hasExistingPreferences && !canOrderAgain && !isJourneyCompleted && <span className="text-success ms-2">✓ Saved</span>}
                      {isJourneyCompleted && <span className="text-info ms-2">🔒 Completed Journey</span>}
                      {isNewOrder && <span className="text-primary ms-2">🍽️ New Order</span>}
                    </Form.Label>
                    <Form.Select 
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value))}
                      disabled={(!isNewOrder && !canOrderAgain && hasExistingPreferences) || isJourneyCompleted}
                    >
                      <option value="">Select number of days...</option>
                      {Array.from({ length: tripDuration > 0 ? tripDuration : 14 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day} day{day > 1 ? 's' : ''} {tripDuration > 0 && day === tripDuration ? '(Full Trip)' : ''}
                        </option>
                      ))}
                    </Form.Select>
                    {tripDuration > 0 ? (
                      <small className="text-muted">
                        Your trip duration is {tripDuration} days. You can order meals for any number of days up to the full trip duration ({tripDuration} days).
                      </small>
                    ) : (
                      <small className="text-muted">
                        You can order meals for up to 14 days. Trip duration will be updated once your itinerary is confirmed.
                      </small>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Meal Option Details */}
              {mealType && mealOptions.length > 0 && (
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body>
                    {(() => {
                      const selectedOption = mealOptions.find(option => option.option_id.toString() === mealType);
                      if (!selectedOption) return null;
                      
                      return (
                        <Row>
                          <Col md={8}>
                            <h5 className="text-primary mb-2">{selectedOption.title}</h5>
                            <p className="mb-2">{selectedOption.description}</p>
                            {selectedOption.key_features && selectedOption.key_features.length > 0 && (
                              <div>
                                <strong>Key Features:</strong>
                                <ul className="mt-2 mb-0">
                                  {selectedOption.key_features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Col>
                          {selectedOption.image && (
                            <Col md={4} className="text-center">
                              <img 
                                src={`http://localhost/Project-I/backend/meal_images/${selectedOption.image}`}
                                alt={selectedOption.title}
                                className="img-fluid rounded"
                                style={{maxHeight: '150px', objectFit: 'cover'}}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </Col>
                          )}
                        </Row>
                      );
                    })()}
                  </Card.Body>
                </Card>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Main Meals (Breakfast, Lunch, Dinner)</strong>
                  {hasExistingPreferences && !canOrderAgain && !isJourneyCompleted && <span className="text-success ms-2">✓ Saved</span>}
                  {isJourneyCompleted && <span className="text-info ms-2">🔒 Completed Journey</span>}
                  {isNewOrder && <span className="text-primary ms-2">🍽️ New Order</span>}
                </Form.Label>
                <div className="meal-times-grid">
                  {MAIN_MEAL_TIMES.map(mealTime => (
                    <Form.Check 
                      key={mealTime.id}
                      type="checkbox"
                      id={mealTime.id}
                      label={mealTime.name}
                      checked={selectedMainMeals.includes(mealTime.id)}
                      onChange={() => handleMainMealChange(mealTime.id)}
                      disabled={(!isNewOrder && !canOrderAgain && hasExistingPreferences) || isJourneyCompleted}
                      className="mb-2"
                    />
                  ))}
                </div>
                <small className="text-muted">
                  Select main meals based on the meal type above
                </small>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Tea Times (Additional Services)</strong>
                  {hasExistingPreferences && !canOrderAgain && !isJourneyCompleted && <span className="text-success ms-2">✓ Saved</span>}
                  {isJourneyCompleted && <span className="text-info ms-2">🔒 Completed Journey</span>}
                  {isNewOrder && <span className="text-primary ms-2">🍽️ New Order</span>}
                </Form.Label>
                <div className="meal-times-grid">
                  {TEA_TIMES.map(teaTime => (
                    <Form.Check 
                      key={teaTime.id}
                      type="checkbox"
                      id={teaTime.id}
                      label={teaTime.name}
                      checked={selectedTeaTimes.includes(teaTime.id)}
                      onChange={() => handleTeaTimeChange(teaTime.id)}
                      disabled={(!isNewOrder && !canOrderAgain && hasExistingPreferences) || isJourneyCompleted}
                      className="mb-2"
                    />
                  ))}
                </div>
                <small className="text-muted">
                  Select additional tea time services as needed
                </small>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>
                  <strong>Notes/Allergies</strong>
                  {hasExistingPreferences && !canOrderAgain && !isJourneyCompleted && <span className="text-success ms-2">✓ Saved</span>}
                  {isJourneyCompleted && <span className="text-info ms-2">🔒 Completed Journey</span>}
                  {isNewOrder && <span className="text-primary ms-2">🍽️ New Order</span>}
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={(!isNewOrder && !canOrderAgain && hasExistingPreferences) || isJourneyCompleted}
                  placeholder="Enter any dietary restrictions, allergies, or special requests..."
                />
              </Form.Group>
            </Form>
            
            {/* Meal History Section */}
            {showHistory && mealHistory.length > 0 && (
              <Card className="mb-4 border-primary">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <FaUtensils className="me-2" />
                    Your Meal Order History
                    <span className="badge bg-primary ms-2">{mealHistory.length} order{mealHistory.length > 1 ? 's' : ''}</span>
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="meal-history-list">
                    {mealHistory.map((order, index) => (
                      <Card key={order.id} className={`mb-3 ${index === 0 ? 'border-success' : 'border-light'}`}>
                        <Card.Header className={`${index === 0 ? 'bg-success text-white' : 'bg-light'} py-2`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              <strong>{order.order_number}</strong> - {order.meal_option_title}
                              {index === 0 && <span className="badge bg-light text-success ms-2">Latest</span>}
                            </span>
                            <small>{new Date(order.order_date).toLocaleDateString()}</small>
                          </div>
                        </Card.Header>
                        <Card.Body className="py-2">
                          <Row>
                            <Col md={6}>
                              <div className="mb-2">
                                <strong>Main Meals:</strong>
                                <div className="ms-2">
                                  {order.main_meal_names && order.main_meal_names.length > 0 ? (
                                    <ul className="mb-0 ps-3">
                                      {order.main_meal_names.map((meal, i) => (
                                        <li key={i}>{meal}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <em className="text-muted">None selected</em>
                                  )}
                                </div>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-2">
                                <strong>Tea Times:</strong>
                                <div className="ms-2">
                                  {order.tea_time_names && order.tea_time_names.length > 0 ? (
                                    <ul className="mb-0 ps-3">
                                      {order.tea_time_names.map((tea, i) => (
                                        <li key={i}>{tea}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <em className="text-muted">None selected</em>
                                  )}
                                </div>
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <strong>Duration:</strong> {order.days} day{order.days > 1 ? 's' : ''}
                            </Col>
                            <Col md={6}>
                              <strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()}
                            </Col>
                          </Row>
                          {order.notes && (
                            <div className="mt-2">
                              <strong>Notes:</strong>
                              <div className="ms-2 fst-italic">{order.notes}</div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
            
            <div className="action-buttons d-flex gap-2 flex-wrap">
              {isJourneyCompleted ? (
                // Show view-only buttons when journey is completed
                <>
                  <Button 
                    variant="info" 
                    onClick={viewMyMeals}
                    className="d-flex align-items-center"
                  >
                    <FaUtensils className="me-2" />
                    {showHistory ? 'Hide' : 'View'} My Meal Orders ({mealHistory.length})
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/customer-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : (hasExistingPreferences && canOrderAgain) || isNewOrder ? (
                // Show order again functionality when preferences exist but can reorder OR in new order mode
                <>
                  {!isNewOrder && (
                    <Button 
                      variant="info" 
                      onClick={viewMyMeals}
                      className="d-flex align-items-center"
                    >
                      <FaUtensils className="me-2" />
                      {showHistory ? 'Hide' : 'View'} My Meal Orders ({mealHistory.length})
                    </Button>
                  )}
                  
                  {!isNewOrder && (
                    <Button 
                      variant="success" 
                      onClick={orderMealsAgain}
                      className="d-flex align-items-center"
                    >
                      <FaSave className="me-2" />
                      Order Meals Again
                    </Button>
                  )}
                  
                  <Button 
                    variant="primary" 
                    onClick={handleSavePreferences}
                    disabled={loading || !mealType || (selectedMainMeals.length === 0 && selectedTeaTimes.length === 0)}
                  >
                    <FaSave className="me-2" />
                    {loading ? 'Saving...' : (isNewOrder ? 'Save New Meal Order' : 'Save Meal Preferences')}
                  </Button>
                  
                  {isNewOrder && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setIsNewOrder(false);
                        setHasExistingPreferences(true);
                        setShowHistory(false);
                        checkExistingPreferences();
                      }}
                    >
                      Cancel New Order
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline-info" 
                    onClick={goToFacilities}
                  >
                    Go to Facility Preferences
                    <FaArrowRight className="ms-2" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/customer-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : hasExistingPreferences ? (
                // Show different buttons when preferences already exist but can't reorder
                <>
                  <Button 
                    variant="info" 
                    onClick={viewMyMeals}
                    className="d-flex align-items-center"
                  >
                    <FaUtensils className="me-2" />
                    {showHistory ? 'Hide' : 'View'} My Meal Orders ({mealHistory.length})
                  </Button>
                  
                  <Button 
                    variant="outline-info" 
                    onClick={goToFacilities}
                  >
                    Go to Facility Preferences
                    <FaArrowRight className="ms-2" />
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    onClick={completeTrip}
                  >
                    Complete Trip Setup
                    <FaArrowRight className="ms-2" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/customer-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : (
                // Show save button when no preferences exist and journey is active
                <>
                  <Button 
                    variant="primary" 
                    onClick={handleSavePreferences}
                    disabled={loading || !mealType || (selectedMainMeals.length === 0 && selectedTeaTimes.length === 0)}
                  >
                    <FaSave className="me-2" />
                    {loading ? 'Saving...' : 'Save Meal Preferences'}
                  </Button>
                  
                  <Button 
                    variant="info" 
                    onClick={goToFacilities}
                  >
                    Go to Facility Preferences
                    <FaArrowRight className="ms-2" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/customer-dashboard')}
                  >
                    Back to Booking History
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default MealsPreferencePage;