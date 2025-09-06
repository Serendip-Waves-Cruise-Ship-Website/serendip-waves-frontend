import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaSpa, FaDumbbell, FaSwimmer, FaFilm, FaDice, FaChild, FaBaby, FaGlassCheers, FaLanguage } from 'react-icons/fa';
import './ThingsToDo.css';

const ThingsToDo = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);

  // Icon mapping for facilities
  const getIconForFacility = (facilityName) => {
    const name = facilityName.toLowerCase();
    if (name.includes('spa') || name.includes('wellness')) return <FaSpa />;
    if (name.includes('fitness') || name.includes('gym')) return <FaDumbbell />;
    if (name.includes('water') || name.includes('sports')) return <FaSwimmer />;
    if (name.includes('cinema') || name.includes('movie')) return <FaFilm />;
    if (name.includes('casino') || name.includes('gaming')) return <FaDice />;
    if (name.includes('kids') || name.includes('child')) return <FaChild />;
    if (name.includes('baby') || name.includes('babysitting')) return <FaBaby />;
    if (name.includes('party') || name.includes('event')) return <FaGlassCheers />;
    if (name.includes('translation') || name.includes('multilingual')) return <FaLanguage />;
    return <FaSpa />; // Default icon
  };

  // Image mapping for facilities (fallback to placeholder images)
  const getImageForFacility = (facilityName, backendImage) => {
    if (backendImage) {
      // Construct full URL for backend images
      return `http://localhost/Project-I/backend/${backendImage}`;
    }
    
    // Return a generic placeholder image if no backend image
    return '/placeholder-facility.jpg';
  };

  // Determine pricing and premium status
  const getPricingInfo = (unitPrice) => {
    const price = parseFloat(unitPrice);
    if (price === 0) {
      return { pricing: "Free", isPremium: false };
    } else {
      return { pricing: "Extra Charge", isPremium: true };
    }
  };

  // Fetch facilities from backend
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('http://localhost/Project-I/backend/manageFacilities.php');
        const data = await response.json();
        
        if (data.success) {
          // Transform backend data to match the existing component structure
          const transformedFacilities = data.facilities
            .filter(facility => facility.status === 'active') // Only show active facilities
            .map(facility => {
              const pricingInfo = getPricingInfo(facility.unit_price);
              const facilityData = {
                id: facility.facility_id,
                name: facility.facility,
                icon: getIconForFacility(facility.facility),
                image: getImageForFacility(facility.facility, facility.image),
                description: facility.about || `Experience our ${facility.facility} service.`,
                pricing: pricingInfo.pricing,
                isPremium: pricingInfo.isPremium
              };
              return facilityData;
            });
          
          setFacilities(transformedFacilities);
        } else {
          console.error('Failed to fetch facilities:', data.message);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      }
    };

    fetchFacilities();
  }, []);

  // Use dynamic facilities from backend
  const displayFacilities = facilities;

  return (
    <div className="things-to-do-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <h1 className="hero-title">Luxury Onboard Facilities</h1>
                <p className="hero-subtitle">
                  Explore the world of comfort, adventure, and care at sea
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              {displayFacilities.map((facility, index) => (
                <React.Fragment key={facility.id}>
                  <Card className="facility-card mb-5">
                    <Row className="g-0">
                      <Col md={5}>
                        <div className="facility-image-container">
                          <img 
                            src={facility.image} 
                            alt={facility.name}
                            className="facility-image"
                            onError={(e) => {
                              // Fallback to placeholder image if backend image fails
                              e.target.src = '/placeholder-facility.jpg';
                            }}
                          />
                        </div>
                      </Col>
                      <Col md={7}>
                        <Card.Body className="facility-content">
                          <div className="facility-header">
                            <div className="facility-icon">
                              {facility.icon}
                            </div>
                            <div>
                              <h3 className="facility-name">{facility.name}</h3>
                              <Badge 
                                bg={facility.isPremium ? "warning" : "success"}
                                className="pricing-badge"
                              >
                                {facility.pricing}
                              </Badge>
                            </div>
                          </div>
                          <p className="facility-description">
                            {facility.description}
                          </p>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                  
                  {/* Divider (except for last item) */}
                  {index < displayFacilities.length - 1 && (
                    <div className="facility-divider">
                      <div className="divider-line"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </Col>
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
                  <h2 className="cta-title">Ready to Enhance Your Cruise Experience?</h2>
                  <p className="cta-text">
                    Already booked your cruise? Add your facility preferences now and customize 
                    your perfect vacation experience at sea!
                  </p>
                  <div className="mt-3">
                    <small className="text-muted">
                      Customize your onboard experience • Book additional services • Save preferences
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

export default ThingsToDo;
