import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaUtensils, FaFilter, FaSignOutAlt } from 'react-icons/fa';
import logo from './assets/logo.png';
import './MealsDashboard.css';

function MealsDashboard() {
  const navigate = useNavigate();
  const [mealsData, setMealsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    passengerName: '',
    bookingId: '',
    mealType: '',
    mealTime: ''
  });

  useEffect(() => {
    fetchMealsData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = mealsData;

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

    if (filters.mealType) {
      filtered = filtered.filter(item => item.mealType === filters.mealType);
    }

    if (filters.mealTime) {
      filtered = filtered.filter(item => 
        item.mealTimes.some(time => time.toLowerCase().includes(filters.mealTime.toLowerCase()))
      );
    }

    setFilteredData(filtered);
  }, [mealsData, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchMealsData = async () => {
    try {
      const response = await fetch('http://localhost/Project-I/backend/getAllMealPreferences.php');
      const data = await response.json();
      
      if (data.success && data.preferences) {
        // Transform the data to match expected structure
        const transformedData = data.preferences.map((pref, index) => {
          // Convert meal IDs to display names
          const mainMealNames = (pref.main_meals || []).map(mealId => {
            switch(mealId) {
              case 'breakfast': return 'Breakfast';
              case 'lunch': return 'Lunch';
              case 'dinner': return 'Dinner';
              default: return mealId;
            }
          });
          
          const teaTimeNames = (pref.tea_times || []).map(teaId => {
            switch(teaId) {
              case 'morning_tea': return 'Morning Teatime';
              case 'evening_tea': return 'Evening Teatime';
              default: return teaId;
            }
          });
          
          return {
            id: index + 1,
            passengerName: pref.passenger_name || 'Unknown',
            bookingId: pref.booking_id,
            mealType: pref.meal_type,
            mealTimes: [...mainMealNames, ...teaTimeNames],
            days: parseInt(pref.days) || 0,
            notes: pref.notes || ''
          };
        });
        
        console.log('Transformed meal data:', transformedData); // Debug log
        setMealsData(transformedData);
      } else {
        setMealsData([]);
      }
    } catch (error) {
      console.error('Failed to fetch meals data:', error);
      setMealsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Navigate to home page
    navigate('/');
  };

  if (loading) {
    return <div className="text-center mt-5">Loading meals data...</div>;
  }

  return (
    <div className="meals-dashboard">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Logo" width="40" height="40" className="me-3" />
            <span className="navbar-brand mb-0 h1 fw-bold text-dark">Meals Dashboard</span>
          </div>
          <div className="d-flex align-items-center">
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleLogout}
              className="rounded-pill px-3"
              style={{ 
                fontWeight: '600'
              }}
            >
              <FaSignOutAlt className="me-1" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <Card className="shadow-lg">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-center align-items-center">
              <h2 className="mb-0">
                <FaUtensils className="me-2" />
                Meal Preferences - Inventory Planning
              </h2>
            </div>
          </Card.Header>
          
          <Card.Body>
            {/* Filters */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaFilter className="me-2" />
                  Filters
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
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
                  <Col md={3}>
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Meal Type</Form.Label>
                      <Form.Select
                        value={filters.mealType}
                        onChange={(e) => handleFilterChange('mealType', e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="Basic/Vegetarian">Basic/Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Halal Gourmet">Halal Gourmet</option>
                        <option value="Diabetic-Friendly">Diabetic-Friendly</option>
                        <option value="Gluten-Free">Gluten-Free</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Meal Time</Form.Label>
                      <Form.Select
                        value={filters.mealTime}
                        onChange={(e) => handleFilterChange('mealTime', e.target.value)}
                      >
                        <option value="">All Times</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Morning Teatime">Morning Teatime</option>
                        <option value="Evening Teatime">Evening Teatime</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Meal Count Summary for Inventory Planning */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUtensils className="me-2" />
                  Meal Count Summary - Inventory Planning
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {(() => {
                    // Calculate meal counts
                    const mealCounts = {};
                    
                    console.log('Filtered data for meal count calculation:', filteredData); // Debug log
                    
                    filteredData.forEach(item => {
                      const mealType = item.mealType;
                      
                      console.log(`Processing item: ${item.passengerName}, mealType: ${mealType}, mealTimes: ${JSON.stringify(item.mealTimes)}, days: ${item.days}`); // Debug log
                      
                      if (!mealCounts[mealType]) {
                        mealCounts[mealType] = {
                          passengers: 0,
                          totalMeals: 0,
                          breakdown: { breakfast: 0, lunch: 0, dinner: 0, morningTea: 0, eveningTea: 0 }
                        };
                      }
                      mealCounts[mealType].passengers += 1;
                      
                      // Count individual meal times (excluding tea services)
                      item.mealTimes.forEach(mealTime => {
                        const mealsForThisType = parseInt(item.days) || 0;
                        
                        console.log(`Processing mealTime: ${mealTime}, days: ${mealsForThisType}`); // Debug log
                        
                        // Only count main meals (breakfast, lunch, dinner) for individual meal type boxes
                        if (mealTime === 'Breakfast') {
                          mealCounts[mealType].totalMeals += mealsForThisType;
                          mealCounts[mealType].breakdown.breakfast += mealsForThisType;
                          console.log(`Added ${mealsForThisType} breakfast meals for ${mealType}`); // Debug log
                        }
                        if (mealTime === 'Lunch') {
                          mealCounts[mealType].totalMeals += mealsForThisType;
                          mealCounts[mealType].breakdown.lunch += mealsForThisType;
                          console.log(`Added ${mealsForThisType} lunch meals for ${mealType}`); // Debug log
                        }
                        if (mealTime === 'Dinner') {
                          mealCounts[mealType].totalMeals += mealsForThisType;
                          mealCounts[mealType].breakdown.dinner += mealsForThisType;
                          console.log(`Added ${mealsForThisType} dinner meals for ${mealType}`); // Debug log
                        }
                        // Tea services are handled separately in the tea summary box
                      });
                    });

                    console.log('Final meal counts:', mealCounts); // Debug log

                    return Object.entries(mealCounts).map(([mealType, data]) => (
                      <Col md={6} lg={4} key={mealType} className="mb-3">
                        <Card className="h-100 meal-count-card">
                          <Card.Header className={`text-white ${mealType === 'Basic/Vegetarian' ? 'bg-success' : 'bg-warning'}`}>
                            <h6 className="mb-0">{mealType}</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-2">
                              <strong>{data.passengers} passengers</strong>
                            </div>
                            <div className="mb-2">
                              <strong>Total meals needed: {data.totalMeals}</strong>
                            </div>
                            <hr className="my-2" />
                            <div className="meal-breakdown">
                              {data.breakdown.breakfast > 0 && (
                                <div className="d-flex justify-content-between">
                                  <span>Breakfast:</span>
                                  <Badge bg="primary">{data.breakdown.breakfast}</Badge>
                                </div>
                              )}
                              {data.breakdown.lunch > 0 && (
                                <div className="d-flex justify-content-between">
                                  <span>Lunch:</span>
                                  <Badge bg="primary">{data.breakdown.lunch}</Badge>
                                </div>
                              )}
                              {data.breakdown.dinner > 0 && (
                                <div className="d-flex justify-content-between">
                                  <span>Dinner:</span>
                                  <Badge bg="primary">{data.breakdown.dinner}</Badge>
                                </div>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ));
                  })()}
                  
                  {/* Total Tea Count Summary */}
                  {filteredData.length > 0 && (() => {
                    const totalTeaCount = filteredData.reduce((sum, item) => {
                      return sum + item.mealTimes.filter(mealTime => 
                        mealTime === 'Morning Teatime' || mealTime === 'Evening Teatime'
                      ).length * item.days;
                    }, 0);
                    
                    const morningTeaCount = filteredData.reduce((sum, item) => {
                      return sum + item.mealTimes.filter(mealTime => 
                        mealTime === 'Morning Teatime'
                      ).length * item.days;
                    }, 0);
                    
                    const eveningTeaCount = filteredData.reduce((sum, item) => {
                      return sum + item.mealTimes.filter(mealTime => 
                        mealTime === 'Evening Teatime'
                      ).length * item.days;
                    }, 0);

                    if (totalTeaCount > 0) {
                      return (
                        <Col md={12} className="mt-3">
                          <Card className="border-info">
                            <Card.Header className="bg-info text-white">
                              <h6 className="mb-0">☕ Total Tea Service Summary</h6>
                            </Card.Header>
                            <Card.Body>
                              <Row className="text-center">
                                <Col md={4}>
                                  <h4 className="text-info">{totalTeaCount}</h4>
                                  <small>Total Tea Services</small>
                                </Col>
                                <Col md={4}>
                                  <h4 className="text-primary">{morningTeaCount}</h4>
                                  <small>Morning Tea Services</small>
                                </Col>
                                <Col md={4}>
                                  <h4 className="text-secondary">{eveningTeaCount}</h4>
                                  <small>Evening Tea Services</small>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    }
                    return null;
                  })()}
                </Row>
                {filteredData.length === 0 && (
                  <div className="text-center text-muted">
                    No meal data available for count summary
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Data Table */}
            <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="table-responsive">
                <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                  <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                    <tr>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Passenger Name</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Booking ID</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Meal Type</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Meal Times</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Days</th>
                      <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Notes/Allergies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>
                          <div style={{ fontSize: '1.1rem' }}>No meal preferences found</div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <tr key={item.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '14px 12px', fontWeight: '500' }}>{item.passengerName}</td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ background: '#e7f0ff', color: '#667eea', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>#{item.bookingId}</span>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ 
                              background: item.mealType === 'Basic/Vegetarian' ? '#d4f4dd' : '#fff4e6',
                              color: item.mealType === 'Basic/Vegetarian' ? '#1e7e34' : '#e65100',
                              padding: '6px 14px',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}>
                              {item.mealType}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {item.mealTimes.map((time, idx) => (
                                <span key={idx} style={{ background: '#e7f0ff', color: '#667eea', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '500' }}>
                                  {time}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '500' }}>{item.days}</td>
                          <td style={{ padding: '14px 12px', color: '#666' }}>{item.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default MealsDashboard;