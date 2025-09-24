import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const API_BASE = 'http://localhost/Project-I/backend';

const DestinationDetails = () => {
  const { country } = useParams();
  const { isAuthenticated, currentUser, setIsBookingModalOpen, setDefaultBookingCountry } = useContext(AuthContext);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/getItineraryDetails.php?destination=${encodeURIComponent(country)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDetail(data[0]);
        } else {
          setError('No itinerary details found for this destination.');
        }
      })
      .catch(() => setError('Failed to fetch itinerary details.'))
      .finally(() => setLoading(false));
  }, [country]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!detail) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0' }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px 0 rgba(30,58,138,0.08)', padding: '2.5rem 2rem', maxWidth: 900, width: '100%', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#1a1ad6',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          wordSpacing: '0.12em',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {detail.destination}
          {detail.start_date && detail.end_date && (
            <>
              <span style={{ color: '#222', fontWeight: 400, margin: '0 10px' }}>—</span>
              <span style={{ color: '#1a1ad6', fontWeight: 700 }}>
                {(() => {
                  const start = new Date(detail.start_date);
                  const end = new Date(detail.end_date);
                  const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
                  return nights;
                })()} NIGHTS
              </span>
            </>
          )}
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(30,58,138,0.10)', padding: '2rem', maxWidth: 1100, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 36, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Left column: Main image, nights breakdown, Book Now button */}
          <div style={{ flex: '0 0 380px', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
            {/* Main large image */}
            {detail.image1 && (
              <img
                src={`http://localhost/Project-I/backend/${detail.image1}`}
                alt="Main"
                style={{ width: 360, height: 240, objectFit: 'cover', borderRadius: 18, boxShadow: '0 2px 12px rgba(30,58,138,0.10)', marginBottom: 18 }}
              />
            )}
            {/* Enhanced Schedule from itinerary details */}
            {detail.schedule && (
              <div style={{
                marginBottom: 18,
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)',
                borderRadius: 18,
                boxShadow: '0 2px 12px #7c4dff11',
                padding: '1.5rem 1.2rem',
                minWidth: 320,
                maxWidth: 380,
                width: '100%',
                textAlign: 'left',
                border: '1.5px solid #d1c4e9',
                fontFamily: 'inherit',
              }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#7c3aed',
                  marginBottom: 10,
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                  textShadow: '0 1px 4px #fff8',
                }}>
                  <span role="img" aria-label="calendar">🗓️</span> Schedule
                </div>
                <div style={{
                  color: '#23213a',
                  fontWeight: 500,
                  fontSize: '1.08rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  paddingLeft: 6,
                }}>
                  {detail.schedule}
                </div>
              </div>
            )}
            {/* Book Now button - only for logged in users */}
            {isAuthenticated && currentUser?.role?.toLowerCase() === 'customer' && (
              <button
                style={{ background: '#ffe066', color: '#222', fontWeight: 700, fontSize: '1.25rem', border: 'none', borderRadius: 30, padding: '12px 38px', marginTop: 10, boxShadow: '0 2px 8px #0001', letterSpacing: 1, cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => {
                  console.log('Book Now clicked', { setIsBookingModalOpen, setDefaultBookingCountry, detail });
                  if (setDefaultBookingCountry) setDefaultBookingCountry(detail.destination);
                  setIsBookingModalOpen(true);
                }}
              >
                BOOK NOW
              </button>
            )}
          </div>
          {/* Right column: 2x2 image grid and description */}
          <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 2x2 grid for images 2-5 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 28, justifyItems: 'center' }}>
              {[2,3,4,5].map(i =>
                detail[`image${i}`] ? (
                  <img
                    key={i}
                    src={`http://localhost/Project-I/backend/${detail[`image${i}`]}`}
                    alt={`img${i}`}
                    style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 14, boxShadow: '0 2px 12px rgba(30,58,138,0.10)' }}
                  />
                ) : null
              )}
            </div>
            {/* Description text */}
            <div style={{ color: '#444', fontSize: '1.08rem', lineHeight: 1.6, textAlign: 'justify' }}>{detail.description}</div>
          </div>
        </div>
        {/* Optionally, add schedule or other info below */}
      </div>
    </div>
  );
};

export default DestinationDetails; 