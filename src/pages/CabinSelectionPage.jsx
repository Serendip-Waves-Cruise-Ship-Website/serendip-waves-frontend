import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import BookingLayout from '../components/BookingLayout';
import axios from 'axios';

const CabinSelectionPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [selectedCabin, setSelectedCabin] = useState(bookingData.cabinType || '');
  const [pricing, setPricing] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingData.destination) {
      navigate('/booking/summary');
      return;
    }
    if (!bookingData.primaryPassenger || !bookingData.primaryPassenger.fullName) {
      navigate('/booking/passengers');
      return;
    }
    fetchPricingAndAvailability();
  }, []);

  const fetchPricingAndAvailability = async () => {
    try {
      const [pricingRes, availabilityRes] = await Promise.all([
        axios.get('http://localhost/Project-I/backend/getCabinTypePricing.php'),
        axios.get('http://localhost/Project-I/backend/getCabinAvailability.php', {
          params: {
            ship_id: bookingData.ship_id,
            route: bookingData.destination
          }
        })
      ]);

      console.log('💰 Cabin pricing response:', pricingRes.data);
      console.log('🔍 Looking for ship_id:', bookingData.ship_id, 'route:', bookingData.destination);

      if (pricingRes.data.success && Array.isArray(pricingRes.data.pricing)) {
        const matchedPricing = pricingRes.data.pricing.find(
          p => String(p.ship_id) === String(bookingData.ship_id) && p.route === bookingData.destination
        );
        console.log('✅ Matched pricing:', matchedPricing);
        setPricing(matchedPricing || {});
      }

      if (availabilityRes.data.success && Array.isArray(availabilityRes.data.cabin_availability)) {
        setAvailability(availabilityRes.data.cabin_availability);
      }
    } catch (error) {
      console.error('Error fetching cabin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cabinTypes = [
    {
      type: 'Interior',
      price: pricing.interior_price,
      icon: '🛏️',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop',
      description: 'Cozy interior cabin with all essential amenities',
      features: ['Twin or queen bed', 'Private bathroom', 'TV & phone', 'Climate control'],
      color: '#60a5fa'
    },
    {
      type: 'Ocean View',
      price: pricing.ocean_view_price,
      icon: '🌊',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&h=300&fit=crop',
      description: 'Stunning ocean views through large windows',
      features: ['Ocean view window', 'Queen bed', 'Sitting area', 'Mini-fridge'],
      color: '#34d399'
    },
    {
      type: 'Balcony',
      price: pricing.balcony_price,
      icon: '🏖️',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop',
      description: 'Private balcony with breathtaking sea views',
      features: ['Private balcony', 'King bed', 'Living area', 'Premium amenities'],
      color: '#f59e0b'
    },
    {
      type: 'Suite',
      price: pricing.suite_price,
      icon: '👑',
      image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500&h=300&fit=crop',
      description: 'Luxurious suite with premium services',
      features: ['Spacious suite', 'Separate bedroom', 'Butler service', 'Priority boarding'],
      color: '#a78bfa'
    }
  ];

  const calculateTotalPrice = (cabinType) => {
    const cabin = cabinTypes.find(c => c.type === cabinType);
    if (!cabin) return 0;
    
    const basePrice = parseFloat(cabin.price) || 0;
    const adultPrice = bookingData.adults * basePrice;
    const childPrice = bookingData.children * basePrice * 0.5;
    return adultPrice + childPrice;
  };

  const getAvailability = (cabinType) => {
    const avail = availability.find(a => a.cabin_type === cabinType);
    return avail || { available: 0, total_capacity: 0 };
  };

  const handleCabinSelect = (cabinType) => {
    setSelectedCabin(cabinType);
  };

  const handleContinue = () => {
    if (!selectedCabin) {
      alert('Please select a cabin type');
      return;
    }

    const totalPrice = calculateTotalPrice(selectedCabin);
    updateBookingData({
      cabinType: selectedCabin,
      totalPrice: totalPrice
    });
    navigate('/booking/payment');
  };

  const handleBack = () => {
    navigate('/booking/passengers');
  };

  if (loading) {
    return (
      <BookingLayout currentStep={3}>
        <div style={{ textAlign: 'center', padding: '64px', color: 'white' }}>
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '16px', fontSize: '18px' }}>Loading cabin options...</p>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout currentStep={3}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
          Choose Your Cabin
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
          Select the perfect cabin for your cruise experience
        </p>

        {/* Booking Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Destination</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{bookingData.destination}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Ship</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{bookingData.ship_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Guests</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                {bookingData.adults} Adult{bookingData.adults > 1 ? 's' : ''} 
                {bookingData.children > 0 && `, ${bookingData.children} Child${bookingData.children > 1 ? 'ren' : ''}`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Duration</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{bookingData.duration_days} Days</div>
            </div>
          </div>
        </div>

        {/* Cabin Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {cabinTypes.map((cabin) => {
            const avail = getAvailability(cabin.type);
            const isAvailable = avail.available > 0;
            const isSelected = selectedCabin === cabin.type;
            const totalPrice = calculateTotalPrice(cabin.type);

            return (
              <div
                key={cabin.type}
                onClick={() => isAvailable && handleCabinSelect(cabin.type)}
                style={{
                  border: isSelected ? `3px solid ${cabin.color}` : '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.6,
                  transition: 'all 0.3s',
                  background: isSelected ? `${cabin.color}15` : 'white',
                  position: 'relative',
                  boxShadow: isSelected ? `0 8px 24px ${cabin.color}40` : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: cabin.color,
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700
                  }}>
                    ✓
                  </div>
                )}

                {!isAvailable && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#ef4444',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    FULL
                  </div>
                )}

                {/* Cabin Image */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={cabin.image}
                    alt={`${cabin.type} cabin`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
                  {cabin.icon} {cabin.type}
                </h3>
                
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                  {cabin.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  {cabin.features.map((feature, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cabin.color }} />
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: '#f9fafb',
                  padding: '16px',
                  borderRadius: '12px',
                  marginTop: '16px'
                }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Price per person
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: cabin.color }}>
                    ${cabin.price || 0}
                  </div>
                  {totalPrice > 0 && (
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #e5e7eb' 
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Total for {bookingData.adults + bookingData.children} guest{bookingData.adults + bookingData.children > 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a202c' }}>
                        ${totalPrice.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                {isAvailable && (
                  <div style={{
                    marginTop: '12px',
                    fontSize: '13px',
                    color: '#22c55e',
                    fontWeight: 600
                  }}>
                    {avail.available} cabin{avail.available > 1 ? 's' : ''} available
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pricing Info */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
            <strong>Pricing Info:</strong> Children under 18 receive 50% discount. All prices include taxes and port fees.
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button
            onClick={handleBack}
            style={{
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedCabin}
            style={{
              background: selectedCabin ? '#7c4dff' : '#d1d5db',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: selectedCabin ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s'
            }}
          >
            Continue to Payment →
          </button>
        </div>
      </div>
    </BookingLayout>
  );
};

export default CabinSelectionPage;
