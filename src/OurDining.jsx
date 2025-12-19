import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaLeaf, FaSeedling, FaMosque, FaHeartbeat, FaBreadSlice, FaUtensils, FaCoffee, FaWineGlass } from 'react-icons/fa';
import axios from 'axios';
import './OurDining.css';


const OurDining = () => {
  const navigate = useNavigate();
  
  // State for meal types from backend
  const [mealTypes, setMealTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping function
  const getIconForMealType = (type) => {
    const iconMap = {
      'Basic/Vegetarian': <FaLeaf />,
      'basic': <FaLeaf />,
      'vegetarian': <FaLeaf />,
      'Vegan': <FaSeedling />,
      'vegan': <FaSeedling />,
      'Halal Gourmet': <FaMosque />,
      'halal': <FaMosque />,
      'Diabetic-Friendly': <FaHeartbeat />,
      'diabetic-friendly': <FaHeartbeat />,
      'diabetic': <FaHeartbeat />,
      'Gluten-Free': <FaBreadSlice />,
      'gluten-free': <FaBreadSlice />,
      'gluten_free': <FaBreadSlice />,
      'Keto': <FaUtensils />,
      'keto': <FaUtensils />,
      'Mediterranean': <FaUtensils />,
      'mediterranean': <FaUtensils />,
      'Asian': <FaUtensils />,
      'asian': <FaUtensils />,
      'Low-Sodium': <FaHeartbeat />,
      'low-sodium': <FaHeartbeat />,
      'Kosher': <FaMosque />,
      'kosher': <FaMosque />
    };
    return iconMap[type] || <FaUtensils />;
  };

  // Badge color mapping function
  const getBadgeColor = (type, index) => {
    const colorMap = {
      'Basic/Vegetarian': 'success',
      'basic': 'success',
      'vegetarian': 'success',
      'Vegan': 'warning',
      'vegan': 'warning',
      'Halal Gourmet': 'info',
      'halal': 'info',
      'Diabetic-Friendly': 'danger',
      'diabetic-friendly': 'danger',
      'diabetic': 'danger',
      'Gluten-Free': 'primary',
      'gluten-free': 'primary',
      'gluten_free': 'primary',
      'Keto': 'dark',
      'keto': 'dark',
      'Mediterranean': 'secondary',
      'mediterranean': 'secondary',
      'Asian': 'success',
      'asian': 'success',
      'Low-Sodium': 'danger',
      'low-sodium': 'danger',
      'Kosher': 'info',
      'kosher': 'info'
    };
    const defaultColors = ['success', 'warning', 'info', 'danger', 'primary'];
    return colorMap[type] || defaultColors[index % defaultColors.length];
  };

  // Badge text mapping function
  const getBadgeText = (type, index) => {
    const badgeMap = {
      'Basic/Vegetarian': 'Most Popular',
      'basic': 'Most Popular',
      'vegetarian': 'Most Popular',
      'Vegan': 'Premium',
      'vegan': 'Premium',
      'Halal Gourmet': 'Certified',
      'halal': 'Certified',
      'Diabetic-Friendly': 'Health Focused',
      'diabetic-friendly': 'Health Focused',
      'diabetic': 'Health Focused',
      'Gluten-Free': 'Celiac Safe',
      'gluten-free': 'Celiac Safe',
      'gluten_free': 'Celiac Safe',
      'Keto': 'Low Carb',
      'keto': 'Low Carb',
      'Mediterranean': 'Heart Healthy',
      'mediterranean': 'Heart Healthy',
      'Asian': 'Authentic',
      'asian': 'Authentic',
      'Low-Sodium': 'Heart Friendly',
      'low-sodium': 'Heart Friendly',
      'Kosher': 'Certified',
      'kosher': 'Certified'
    };
    const defaultBadges = ['Featured', 'Premium', 'Special', 'Popular', 'Recommended'];
    return badgeMap[type] || defaultBadges[index % defaultBadges.length];
  };

  // Get fallback image function
  const getFallbackImage = (type, index) => {
    const fallbackImages = {
      'basic': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'vegan': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'halal': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'diabetic': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'gluten_free': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    };
    const defaultImages = [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ];
    return fallbackImages[type.toLowerCase()] || defaultImages[index % defaultImages.length];
  };

  const fetchMealOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/Project-I/backend/mealOptionsAPI.php');
      
      if (response.data.success && response.data.data) {
        // Transform backend data to match component structure
        const transformedData = response.data.data
          .filter(option => option.status === 'active') // Only show active meal options
          .map((option, index) => ({
            id: option.option_id || index,
            name: option.title,
            icon: getIconForMealType(option.type),
            image: option.image ? `http://localhost/Project-I/backend/meal_images/${option.image}` : getFallbackImage(option.type, index),
            description: option.description,
            features: Array.isArray(option.key_features) ? option.key_features : (option.key_features ? option.key_features.split(',').map(f => f.trim()) : []),
            badge: getBadgeText(option.type, index),
            badgeColor: getBadgeColor(option.type, index),
            type: option.type,
            status: option.status
          }));

        setMealTypes(transformedData);
      } else {
        setMealTypes([]);
      }
    } catch (error) {
      console.error('Error fetching meal options:', error);
      setMealTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch meal options from backend
  useEffect(() => {
    fetchMealOptions();
  }, [fetchMealOptions]);

  const diningTimes = [
    {
      name: 'Breakfast',
      time: '7:00 AM - 10:00 AM',
      icon: <FaCoffee />,
      description: 'Start your day with energizing breakfast options',
      specialties: ['Fresh fruits', 'Artisan breads', 'Local specialties', 'Fresh juices']
    },
    {
      name: 'Lunch',
      time: '12:00 PM - 3:00 PM',
      icon: <FaUtensils />,
      description: 'Satisfy your midday appetite with diverse lunch selections',
      specialties: ['International cuisine', 'Fresh salads', 'Grilled options', 'Light meals']
    },
    {
      name: 'Dinner',
      time: '6:00 PM - 10:00 PM',
      icon: <FaWineGlass />,
      description: 'Experience fine dining with our elegant dinner service',
      specialties: ['Multi-course meals', 'Wine pairings', 'Premium ingredients', 'Chef specials']
    }
  ];

  const teaServices = [
    {
      name: 'Morning Teatime',
      time: '10:30 AM - 11:30 AM',
      description: 'Traditional morning tea service with pastries and light refreshments'
    },
    {
      name: 'Evening Teatime',
      time: '4:00 PM - 5:30 PM',
      description: 'Afternoon tea experience with elegant accompaniments'
    }
  ];

  return (
    <div className="our-dining-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <h1 className="hero-title">Exceptional Dining at Sea</h1>
                <p className="hero-subtitle">
                  Discover our world-class culinary offerings tailored to every dietary preference and lifestyle
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Meal Types Section */}
      <section className="meal-types-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title">Our Specialty Dining Options</h2>
              <p className="section-subtitle">
                Each meal type is carefully crafted to meet specific dietary needs without compromising on taste or quality
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col lg={10}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading our dining options...</p>
                </div>
              ) : (
                mealTypes.map((mealType, index) => (
                  <React.Fragment key={mealType.id}>
                    <Card className="meal-type-card mb-5">
                      <Row className="g-0">
                        <Col md={5}>
                          <div className="meal-image-container">
                            <img 
                              src={mealType.image} 
                              alt={mealType.name}
                              className="meal-image"
                              onError={(e) => {
                                // Fallback to online image if local image fails
                                const fallbacks = {
                                  'basic': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'vegan': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'halal': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'diabetic': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                                  'gluten_free': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                                };
                                e.target.src = fallbacks[mealType.id] || fallbacks[mealType.type?.toLowerCase()] || '/placeholder-meal.jpg';
                              }}
                            />
                          </div>
                        </Col>
                        <Col md={7}>
                          <Card.Body className="meal-content">
                            <div className="meal-header">
                              <div className="meal-icon">
                                {mealType.icon}
                              </div>
                              <div>
                                <h3 className="meal-name">{mealType.name}</h3>
                                <Badge 
                                  bg={mealType.badgeColor}
                                  className="meal-badge"
                                >
                                  {mealType.type}
                                </Badge>
                              </div>
                            </div>
                            <p className="meal-description">
                              {mealType.description}
                            </p>
                            <div className="meal-features">
                              <h6>Key Features:</h6>
                              <ul>
                                {mealType.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                    
                    {/* Divider (except for last item) */}
                    {index < mealTypes.length - 1 && (
                      <div className="meal-divider">
                        <div className="divider-line"></div>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Dining Times Section */}
      <section className="dining-times-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title">Daily Dining Schedule</h2>
              <p className="section-subtitle">
                Flexible dining times to accommodate your cruise schedule and preferences
              </p>
            </Col>
          </Row>
          
          <Row>
            {diningTimes.map((timeSlot) => (
              <Col md={4} key={timeSlot.name} className="mb-4">
                <Card className="dining-time-card h-100">
                  <Card.Body className="text-center">
                    <div className="dining-icon mb-3">
                      {timeSlot.icon}
                    </div>
                    <h4 className="dining-time-name">{timeSlot.name}</h4>
                    <p className="dining-time-hours">{timeSlot.time}</p>
                    <p className="dining-time-description">{timeSlot.description}</p>
                    <div className="dining-specialties">
                      <h6>Today's Specialties:</h6>
                      <div className="specialties-list">
                        {timeSlot.specialties.map((specialty, idx) => (
                          <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Tea Services Section */}
      <section className="tea-services-section">
        <Container>
          <Row className="justify-content-center mb-4">
            <Col lg={8} className="text-center">
              <h2 className="section-title">Traditional Tea Services</h2>
              <p className="section-subtitle">
                Elegant tea experiences that bring relaxation and refinement to your cruise
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            {teaServices.map((service) => (
              <Col md={6} key={service.name} className="mb-4">
                <Card className="tea-service-card">
                  <Card.Body className="text-center">
                    <div className="tea-icon mb-3">
                      <FaCoffee />
                    </div>
                    <h4 className="tea-service-name">{service.name}</h4>
                    <p className="tea-service-time">{service.time}</p>
                    <p className="tea-service-description">{service.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <Card className="cta-card">
                <Card.Body className="p-5">
                  <h2 className="cta-title">Ready to Experience Our Culinary Excellence?</h2>
                  <p className="cta-text">
                    Book your cruise today and discover why our dining experience is considered among 
                    the finest at sea. Our chefs are ready to create unforgettable culinary memories for you.
                  </p>
                  <div className="cta-buttons">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="cta-button me-3"
                      onClick={() => navigate('/cruise-ships')}
                    >
                      View Our Cruises
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="lg" 
                      className="cta-button"
                      onClick={() => navigate('/destinations')}
                    >
                      Browse Destinations
                    </Button>
                  </div>
                  <div className="mt-4">
                    <small className="text-muted">
                      Custom meal preferences • Special dietary accommodations • World-class chefs
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default OurDining;
