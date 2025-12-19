import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';

const BookingLayout = ({ children, currentStep }) => {
  const navigate = useNavigate();
  const { resetBooking } = useBooking();

  const steps = [
    { number: 1, label: 'Cruise Summary', path: '/booking/summary' },
    { number: 2, label: 'Passengers', path: '/booking/passengers' },
    { number: 3, label: 'Cabin Selection', path: '/booking/cabin' },
    { number: 4, label: 'Payment', path: '/booking/payment' },
  ];

  const handleExitBooking = () => {
    if (window.confirm('Are you sure you want to exit? Your booking progress will be lost.')) {
      resetBooking();
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="Serendip Waves" style={{ height: '50px' }} />
          <h2 style={{ margin: 0, color: '#1a202c', fontWeight: 700 }}>Book Your Cruise</h2>
        </div>
        <button
          onClick={handleExitBooking}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          Exit Booking
        </button>
      </div>

      {/* Progress Stepper */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '24px 32px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: currentStep >= step.number ? '#7c4dff' : '#e0e0e0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '20px',
                  marginBottom: '8px',
                  transition: 'all 0.3s',
                  border: currentStep === step.number ? '4px solid #b794f6' : 'none'
                }}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: currentStep >= step.number ? 700 : 500,
                  color: currentStep >= step.number ? '#7c4dff' : '#9ca3af',
                  textAlign: 'center',
                  maxWidth: '120px'
                }}>
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  height: '4px',
                  flex: 1,
                  background: currentStep > step.number ? '#7c4dff' : '#e0e0e0',
                  marginBottom: '40px',
                  transition: 'all 0.3s'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 64px' }}>
        {children}
      </div>
    </div>
  );
};

export default BookingLayout;
