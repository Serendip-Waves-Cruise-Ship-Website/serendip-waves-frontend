import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import BookingLayout from '../components/BookingLayout';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData, resetBooking } = useBooking();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    cardType: bookingData.cardType || 'Visa',
    cardNumber: bookingData.cardNumber || '',
    expiry: bookingData.expiry || '',
    cvv: bookingData.cvv || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!bookingData.destination || !bookingData.cabinType || !bookingData.primaryPassenger.fullName) {
      navigate('/booking/passengers');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setForm(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.cardNumber || form.cardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    if (!form.expiry || form.expiry.length !== 5) {
      newErrors.expiry = 'Expiry must be in MM/YY format';
    }
    if (!form.cvv || form.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const allPassengers = [
        bookingData.primaryPassenger,
        ...bookingData.additionalPassengers
      ];

      const bookingPayload = {
        full_name: bookingData.primaryPassenger.fullName,
        gender: bookingData.primaryPassenger.gender,
        email: bookingData.primaryPassenger.email,
        citizenship: bookingData.primaryPassenger.citizenship,
        age: bookingData.primaryPassenger.age,
        room_type: bookingData.cabinType,
        adults: bookingData.adults,
        children: bookingData.children,
        number_of_guests: bookingData.adults + bookingData.children,
        ship_name: bookingData.ship_name,
        ship_id: bookingData.ship_id,
        destination: bookingData.destination,
        card_type: form.cardType,
        card_number: form.cardNumber,
        card_expiry: form.expiry,
        total_price: bookingData.totalPrice
      };

      const response = await axios.post(
        'http://localhost/Project-I/backend/addBooking.php',
        bookingPayload
      );

      if (!response.data.success) {
        showError(response.data.message || 'Booking failed');
        setLoading(false);
        return;
      }

      const bookingId = response.data.booking_id;
      const cabinNumber = response.data.cabin_number;

      // Add passengers
      try {
        const passengerPayload = {
          booking_id: bookingId,
          ship_id: bookingData.ship_id,
          ship_name: bookingData.ship_name,
          route: bookingData.destination,
          cabin_id: cabinNumber || '',
          passengerList: allPassengers.map(p => ({
            passenger_name: p.fullName,
            email: p.email || bookingData.primaryPassenger.email,
            age: p.age,
            gender: p.gender,
            citizenship: p.citizenship
          }))
        };

        await axios.post(
          'http://localhost/Project-I/backend/addPassengers.php',
          passengerPayload
        );
      } catch (error) {
        console.error('Passenger addition error:', error);
      }

      // Send confirmation email
      try {
        const emailPayload = {
          email: bookingData.primaryPassenger.email,
          full_name: bookingData.primaryPassenger.fullName,
          booking_id: bookingId,
          cruise_title: bookingData.destination,
          cabin_type: bookingData.cabinType,
          cabin_number: cabinNumber,
          adults: bookingData.adults,
          children: bookingData.children,
          departure_date: bookingData.start_date || 'TBD',
          return_date: bookingData.end_date || 'TBD',
          total_price: bookingData.totalPrice,
          ship_name: bookingData.ship_name,
          destination: bookingData.destination
        };

        await axios.post(
          'http://localhost/Project-I/backend/sendBookingConfirmation.php',
          emailPayload
        );
      } catch (error) {
        console.error('Email error:', error);
      }

      // Create custom success notification with green background
      const successToast = document.createElement('div');
      successToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        font-size: 16px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
      `;
      successToast.textContent = '✓ Booking successful!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        successToast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(successToast), 300);
      }, 3000);
      
      // Navigate to success page with booking details
      navigate('/booking/success', {
        state: {
          bookingId,
          cabinNumber,
          email: bookingData.primaryPassenger.email,
          bookingDetails: {
            fullName: bookingData.primaryPassenger.fullName,
            destination: bookingData.destination,
            shipName: bookingData.ship_name,
            cabinType: bookingData.cabinType,
            adults: bookingData.adults,
            children: bookingData.children,
            totalPrice: bookingData.totalPrice,
            departureDate: bookingData.start_date || 'TBD',
            returnDate: bookingData.end_date || 'TBD',
            departurePort: bookingData.departure_port || 'TBD',
            bookingDate: new Date().toLocaleDateString(),
            paymentStatus: 'PAID',
            passengers: [bookingData.primaryPassenger, ...bookingData.additionalPassengers]
          }
        }
      });

      // Reset booking after successful submission
      setTimeout(() => resetBooking(), 1000);

    } catch (error) {
      console.error('Booking error:', error);
      showError('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/booking/cabin');
  };

  return (
    <BookingLayout currentStep={4}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
          Payment Details
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px' }}>
          Complete your booking with secure payment
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          {/* Payment Form */}
          <div>
            {/* Total Amount Display */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px',
              borderRadius: '16px',
              marginBottom: '32px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>Total Amount</div>
              <div style={{ fontSize: '48px', fontWeight: 700 }}>${bookingData.totalPrice?.toFixed(2)}</div>
              <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
                For {bookingData.adults + bookingData.children} guest{bookingData.adults + bookingData.children > 1 ? 's' : ''}
              </div>
            </div>

            {/* Card Type Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 600, color: '#374151', marginBottom: '12px', display: 'block', fontSize: '16px' }}>
                Card Type
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: form.cardType === 'Visa' ? '3px solid #7c4dff' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    background: form.cardType === 'Visa' ? '#f3f0ff' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  <input
                    type="radio"
                    name="cardType"
                    value="Visa"
                    checked={form.cardType === 'Visa'}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                    alt="Visa"
                    style={{ height: '24px' }}
                  />
                  <span style={{ fontWeight: 600, color: '#1a202c' }}>Visa</span>
                </label>

                <label
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: form.cardType === 'Master Card' ? '3px solid #7c4dff' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    background: form.cardType === 'Master Card' ? '#f3f0ff' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  <input
                    type="radio"
                    name="cardType"
                    value="Master Card"
                    checked={form.cardType === 'Master Card'}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                    alt="MasterCard"
                    style={{ height: '24px' }}
                  />
                  <span style={{ fontWeight: 600, color: '#1a202c' }}>MasterCard</span>
                </label>
              </div>
            </div>

            {/* Card Number */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                className="payment-input"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: errors.cardNumber ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  background: 'white',
                  color: '#1a202c'
                }}
              />
              {errors.cardNumber && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.cardNumber}</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Expiry Date */}
              <div>
                <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                  Expiry Date *
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="payment-input"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: errors.expiry ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '18px',
                    fontFamily: 'monospace',
                    background: 'white',
                    color: '#1a202c'
                  }}
                />
                {errors.expiry && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.expiry}</div>
                )}
              </div>

              {/* CVV */}
              <div>
                <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="3"
                  className="payment-input"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: errors.cvv ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '18px',
                    fontFamily: 'monospace',
                    background: 'white',
                    color: '#1a202c'
                  }}
                />
                {errors.cvv && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.cvv}</div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '24px' }}>🔒</div>
              <div style={{ fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
                <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We never store your full card details.
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div>
            <div style={{
              background: '#f9fafb',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              position: 'sticky',
              top: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a202c', marginBottom: '20px' }}>
                Booking Summary
              </h3>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Destination</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c' }}>{bookingData.destination}</div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Ship</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c' }}>{bookingData.ship_name}</div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Cabin Type</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c' }}>{bookingData.cabinType}</div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Guests</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c' }}>
                  {bookingData.adults} Adult{bookingData.adults > 1 ? 's' : ''}
                  {bookingData.children > 0 && `, ${bookingData.children} Child${bookingData.children > 1 ? 'ren' : ''}`}
                </div>
              </div>

              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Duration</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a202c' }}>{bookingData.duration_days} Days</div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #1a202c' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c' }}>Total</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#7c4dff' }}>
                    ${bookingData.totalPrice?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button
            onClick={handleBack}
            disabled={loading}
            style={{
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s'
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? '#d1d5db' : '#22c55e',
              color: 'white',
              border: 'none',
              padding: '14px 48px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <span>🔒</span> Confirm & Pay
              </>
            )}
          </button>
        </div>
      </div>
    </BookingLayout>
  );
};

export default PaymentPage;
