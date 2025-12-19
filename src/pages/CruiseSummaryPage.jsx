import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { AuthContext } from '../AuthContext';
import BookingLayout from '../components/BookingLayout';
import axios from 'axios';

const CruiseSummaryPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const { defaultBookingCountry } = React.useContext(AuthContext);
  const [itinerary, setItinerary] = useState(null);
  const [shipImage, setShipImage] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItineraryDetails();
  }, []);

  const fetchItineraryDetails = async () => {
    try {
      // Get the destination from defaultBookingCountry or bookingData
      const destination = defaultBookingCountry || bookingData.destination;
      
      if (!destination) {
        // If no destination selected, redirect to destinations page
        navigate('/destinations');
        return;
      }

      // Declare matchedItinerary at function scope
      let matchedItinerary = null;

      // Fetch all itineraries
      const itinerariesResponse = await axios.get('http://localhost/Project-I/backend/getItineraries.php');
      console.log('📋 Itineraries API response:', itinerariesResponse.data);
      
      if (Array.isArray(itinerariesResponse.data)) {
        // Find the itinerary matching the destination
        matchedItinerary = itinerariesResponse.data.find(
          item => item.route === destination || item.destination === destination
        );

        if (matchedItinerary) {
          console.log('✅ Matched itinerary:', matchedItinerary);
          console.log('💰 Itinerary price from database:', matchedItinerary.price);
          setItinerary(matchedItinerary);
          
          // Calculate duration from dates
          let durationDays = matchedItinerary.duration_days || 7;
          let durationNights = durationDays - 1;
          
          if (matchedItinerary.start_date && matchedItinerary.end_date) {
            const startDate = new Date(matchedItinerary.start_date);
            const endDate = new Date(matchedItinerary.end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            durationDays = diffDays;
            durationNights = diffDays;
          }
          
          // Update booking context with itinerary details
          updateBookingData({
            destination: matchedItinerary.route || matchedItinerary.destination,
            ship_id: matchedItinerary.ship_id || matchedItinerary.ship_details_id,
            ship_name: matchedItinerary.ship_name,
            itinerary_id: matchedItinerary.id,
            start_date: matchedItinerary.start_date,
            end_date: matchedItinerary.end_date,
            duration_days: durationDays,
            duration_nights: durationNights,
          });
        } else {
          // No matching itinerary found
          console.error('❌ No itinerary matched for destination:', destination);
          navigate('/destinations');
          return;
        }
      }

      // Fetch itinerary details with images - preserve the price field
      const detailsResponse = await axios.get(
        `http://localhost/Project-I/backend/getItineraryDetails.php?destination=${encodeURIComponent(destination)}`
      );
      console.log('📋 Itinerary details response:', detailsResponse.data);

      if (Array.isArray(detailsResponse.data) && detailsResponse.data.length > 0) {
        // Preserve the price from matchedItinerary when merging
        const preservedPrice = matchedItinerary.price;
        setItinerary(prev => ({
          ...prev,
          ...detailsResponse.data[0],
          price: preservedPrice  // Keep the price from itineraries table
        }));
        console.log('💰 Preserved itinerary price:', preservedPrice);
      }

      // Fetch ship details for image
      if (matchedItinerary && (matchedItinerary.ship_id || matchedItinerary.ship_details_id)) {
        const targetShipId = matchedItinerary.ship_id || matchedItinerary.ship_details_id;
        console.log('🔍 Fetching ship details for ship_id:', targetShipId, 'ship_name:', matchedItinerary.ship_name);
        const shipResponse = await axios.get('http://localhost/Project-I/backend/getShipDetails.php');
        console.log('📦 Ship response data (total ships):', shipResponse.data?.length || 0);
        console.log('📦 All ships:', shipResponse.data);
        if (Array.isArray(shipResponse.data)) {
          // Try matching by ship_id (could be string or number)
          const ship = shipResponse.data.find(s => 
            String(s.ship_id) === String(targetShipId) || 
            s.ship_name === matchedItinerary.ship_name
          );
          console.log('🚢 Found ship:', ship);
          if (ship && ship.ship_image) {
            console.log('✅ Setting ship image:', ship.ship_image);
            setShipImage(ship.ship_image);
          } else if (ship) {
            console.warn('⚠️ Ship found but no ship_image field:', ship);
            console.warn('⚠️ Ship object keys:', Object.keys(ship));
          } else {
            console.error('❌ No ship matched. Target ship_id:', targetShipId, 'ship_name:', matchedItinerary.ship_name);
          }
        } else {
          console.error('❌ Ship response is not an array:', shipResponse.data);
        }
      } else {
        console.warn('⚠️ No matchedItinerary or ship_id available. matchedItinerary:', matchedItinerary);
      }

      // Fetch pricing
      const pricingResponse = await axios.get('http://localhost/Project-I/backend/getCabinTypePricing.php');
      console.log('💰 Fetching pricing for ship_id:', matchedItinerary?.ship_id, 'route:', destination);
      console.log('💰 Pricing API response:', pricingResponse.data);
      
      let foundPricing = null;
      if (pricingResponse.data.success && Array.isArray(pricingResponse.data.pricing)) {
        foundPricing = pricingResponse.data.pricing.find(
          p => String(p.ship_id) === String(matchedItinerary.ship_id) && p.route === destination
        );
        console.log('💰 Matched pricing from cabin_type_pricing:', foundPricing);
        if (foundPricing) {
          setPricing(foundPricing);
        }
      }

      // If no cabin pricing found, use itinerary base price as fallback
      if (!foundPricing && matchedItinerary && matchedItinerary.price && Number(matchedItinerary.price) > 0) {
        const basePrice = Number(matchedItinerary.price);
        console.log('💰 Using itinerary base price as fallback:', basePrice);
        const fallbackPricing = {
          interior_price: basePrice,
          ocean_view_price: Math.round(basePrice * 1.3),
          balcony_price: Math.round(basePrice * 1.5),
          suite_price: Math.round(basePrice * 2)
        };
        setPricing(fallbackPricing);
      } else if (!foundPricing) {
        console.error('❌ No pricing available from any source. matchedItinerary.price:', matchedItinerary?.price);
      }

    } catch (error) {
      console.error('Error fetching itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!itinerary) {
      alert('Unable to load cruise details. Please try again.');
      return;
    }
    navigate('/booking/passengers');
  };

  const handleBack = () => {
    navigate('/destinations');
  };

  // Compute a compact starting price (lowest per-person cabin price)
  const startingPrice = (() => {
    if (!pricing) return null;
    const candidates = [pricing.interior_price, pricing.ocean_view_price, pricing.balcony_price, pricing.suite_price]
      .filter(v => v !== undefined && v !== null && v !== '')
      .map(v => Number(v));
    if (candidates.length === 0) return null;
    return Math.min(...candidates);
  })();
  if (loading) {
    return (
      <BookingLayout currentStep={1}>
        <div style={{ textAlign: 'center', padding: '64px', color: 'white' }}>
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '16px', fontSize: '18px' }}>Loading cruise details...</p>
        </div>
      </BookingLayout>
    );
  }

  if (!itinerary) {
    return (
      <BookingLayout currentStep={1}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '64px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>No Cruise Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            We couldn't find cruise details for this destination.
          </p>
          <button
            onClick={handleBack}
            style={{
              background: '#7c4dff',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Browse Destinations
          </button>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout currentStep={1}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
            {itinerary.destination || itinerary.route}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>
            {itinerary.duration_days} Days Luxury Cruise Experience
          </p>
        </div>

        {/* Main Ship Image */}
        {shipImage ? (
          <div style={{
            width: '100%',
            height: '400px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '32px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            position: 'relative'
          }}>
            <img
              src={`http://localhost/Project-I/backend/${shipImage}`}
              alt={itinerary.ship_name}
              onError={(e) => {
                console.error('❌ Ship image failed to load:', e.target.src);
              }}
              onLoad={() => console.log('✅ Ship image loaded successfully:', shipImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{itinerary.ship_name}</div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Your luxury cruise ship</div>
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '400px',
            borderRadius: '16px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚢</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{itinerary.ship_name}</div>
            </div>
          </div>
        )}

        {/* Cruise Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Ship Details */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚢</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Your Ship</h3>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>{itinerary.ship_name}</p>
          </div>

          {/* Duration */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Duration</h3>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {(() => {
                if (itinerary.start_date && itinerary.end_date) {
                  const start = new Date(itinerary.start_date);
                  const end = new Date(itinerary.end_date);
                  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                  const days = nights + 1;
                  return `${days} Days / ${nights} Nights`;
                }
                return `${itinerary.duration_days || 7} Days / ${(itinerary.duration_days || 7) - 1} Nights`;
              })()}
            </p>
          </div>

          {/* Departure Port */}
          {itinerary.departure_port && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚓</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Departure Port</h3>
              <p style={{ fontSize: '24px', fontWeight: 700 }}>{itinerary.departure_port}</p>
            </div>
          )}

          {/* Dates */}
          {itinerary.start_date && itinerary.end_date && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗓️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Travel Dates</h3>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>
                {new Date(itinerary.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                <br />to<br />
                {new Date(itinerary.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Starting Prices */}
        {pricing && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px',
            borderRadius: '16px',
            marginBottom: '32px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(124, 77, 255, 0.3)'
          }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
              Starting Prices
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {(pricing.interior_price !== undefined && pricing.interior_price !== null && pricing.interior_price !== '') && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Interior Cabin</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>${Number(pricing.interior_price).toFixed(0)}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>per person</div>
                </div>
              )}
              {(pricing.ocean_view_price !== undefined && pricing.ocean_view_price !== null && pricing.ocean_view_price !== '') && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Ocean View</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>${Number(pricing.ocean_view_price).toFixed(0)}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>per person</div>
                </div>
              )}
              {(pricing.balcony_price !== undefined && pricing.balcony_price !== null && pricing.balcony_price !== '') && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Balcony Cabin</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>${Number(pricing.balcony_price).toFixed(0)}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>per person</div>
                </div>
              )}
              {(pricing.suite_price !== undefined && pricing.suite_price !== null && pricing.suite_price !== '') && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Luxury Suite</div>
                  <div style={{ fontSize: '32px', fontWeight: 700 }}>${Number(pricing.suite_price).toFixed(0)}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>per person</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {(itinerary.image2 || itinerary.image3 || itinerary.image4) && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1a202c', marginBottom: '16px' }}>
              Gallery
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {itinerary.image2 && (
                <img
                  src={`http://localhost/Project-I/backend/${itinerary.image2}`}
                  alt="Gallery 2"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              )}
              {itinerary.image3 && (
                <img
                  src={`http://localhost/Project-I/backend/${itinerary.image3}`}
                  alt="Gallery 3"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              )}
              {itinerary.image4 && (
                <img
                  src={`http://localhost/Project-I/backend/${itinerary.image4}`}
                  alt="Gallery 4"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Schedule */}
        {itinerary.schedule && (
          <div style={{
            background: 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '32px',
            border: '2px solid #d1c4e9'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed', marginBottom: '16px' }}>
              📅 Itinerary Schedule
            </h3>
            <div style={{
              color: '#374151',
              fontSize: '16px',
              lineHeight: '1.8',
              whiteSpace: 'pre-line'
            }}>
              {itinerary.schedule}
            </div>
          </div>
        )}

        {/* Description */}
        {itinerary.description && (
          <div style={{
            background: '#f9fafb',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '32px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1a202c', marginBottom: '16px' }}>
              About This Cruise
            </h3>
            <p style={{
              color: '#4b5563',
              fontSize: '16px',
              lineHeight: '1.8'
            }}>
              {itinerary.description}
            </p>
          </div>
        )}

        {/* Navigation + Compact Pricing */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: '32px' }}>
          {/* Left: Browse button (flex-grow) */}
          <div style={{ flex: 1 }}>
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
              ← Browse Other Destinations
            </button>
          </div>

          {/* Center: Compact Starting Price (left of Continue) */}
          <div style={{ minWidth: 220, display: 'flex', justifyContent: 'center' }}>
            {startingPrice !== null ? (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '12px 18px',
                border: '1px solid #e6e6ff',
                boxShadow: '0 8px 20px rgba(124,77,255,0.08)',
                textAlign: 'center',
                width: '100%'
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Starting From</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a202c' }}>${startingPrice.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>/ person</div>
              </div>
            ) : null}
          </div>

          {/* Right: Continue button */}
          <div style={{ flex: '0 0 auto' }}>
            <button
              onClick={handleContinue}
              style={{
                background: '#7c4dff',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Continue to Cabin Selection →
            </button>
          </div>
        </div>
      </div>
    </BookingLayout>
  );
};

export default CruiseSummaryPage;
