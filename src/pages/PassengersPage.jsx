import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { AuthContext } from '../AuthContext';
import BookingLayout from '../components/BookingLayout';

const PassengersPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const { currentUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    adults: bookingData.adults || 1,
    children: bookingData.children || 0,
    primaryPassenger: bookingData.primaryPassenger || {
      fullName: currentUser?.full_name || '',
      gender: currentUser?.gender || '',
      citizenship: '',
      email: currentUser?.email || '',
      age: currentUser?.age || '',
    },
    additionalPassengers: bookingData.additionalPassengers || [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!bookingData.destination) {
      navigate('/booking/summary');
    }
  }, [bookingData.destination, navigate]);

  useEffect(() => {
    const totalPassengers = form.adults + form.children;
    const currentPassengers = form.additionalPassengers.length;
    
    if (totalPassengers - 1 > currentPassengers) {
      const newPassengers = Array(totalPassengers - 1 - currentPassengers).fill().map((_, i) => {
        const passengerIndex = currentPassengers + i;
        return {
          fullName: '',
          gender: '',
          citizenship: '',
          age: '',
          isChild: passengerIndex >= (form.adults - 1)
        };
      });
      setForm(prev => ({
        ...prev,
        additionalPassengers: [...prev.additionalPassengers, ...newPassengers]
      }));
    } else if (totalPassengers - 1 < currentPassengers) {
      setForm(prev => ({
        ...prev,
        additionalPassengers: prev.additionalPassengers.slice(0, totalPassengers - 1)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        additionalPassengers: prev.additionalPassengers.map((passenger, index) => ({
          ...passenger,
          isChild: index >= (form.adults - 1)
        }))
      }));
    }
  }, [form.adults, form.children]);

  const handleAdultsChange = (e) => {
    const adults = Number(e.target.value);
    const maxChildren = 7 - adults;
    setForm(prev => ({
      ...prev,
      adults,
      children: Math.min(prev.children, maxChildren)
    }));
  };

  const handleChildrenChange = (e) => {
    const children = Number(e.target.value);
    setForm(prev => ({ ...prev, children }));
  };

  const handlePrimaryPassengerChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      primaryPassenger: {
        ...prev.primaryPassenger,
        [name]: value
      }
    }));
  };

  const handleAdditionalPassengerChange = (index, e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updatedPassengers = [...prev.additionalPassengers];
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [name]: value
      };
      return {
        ...prev,
        additionalPassengers: updatedPassengers
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.primaryPassenger.fullName) newErrors.primaryFullName = 'Full name is required';
    if (!form.primaryPassenger.gender) newErrors.primaryGender = 'Gender is required';
    if (!form.primaryPassenger.citizenship) newErrors.primaryCitizenship = 'Citizenship is required';
    if (!form.primaryPassenger.email) newErrors.primaryEmail = 'Email is required';
    if (!form.primaryPassenger.age) newErrors.primaryAge = 'Age is required';

    const primaryAge = parseInt(form.primaryPassenger.age);
    if (primaryAge < 18) {
      newErrors.primaryAge = 'Primary passenger must be 18 years or older';
    }

    form.additionalPassengers.forEach((passenger, index) => {
      if (!passenger.fullName) newErrors[`passenger${index}FullName`] = 'Full name is required';
      if (!passenger.gender) newErrors[`passenger${index}Gender`] = 'Gender is required';
      if (!passenger.citizenship) newErrors[`passenger${index}Citizenship`] = 'Citizenship is required';
      if (!passenger.age) newErrors[`passenger${index}Age`] = 'Age is required';

      const age = parseInt(passenger.age);
      if (passenger.isChild && age >= 18) {
        newErrors[`passenger${index}Age`] = 'Child must be under 18 years old';
      }
      if (!passenger.isChild && age < 18) {
        newErrors[`passenger${index}Age`] = 'Adult must be 18 years or older';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateBookingData({
        adults: form.adults,
        children: form.children,
        primaryPassenger: form.primaryPassenger,
        additionalPassengers: form.additionalPassengers,
      });
      navigate('/booking/cabin');
    }
  };

  const handleBack = () => {
    navigate('/booking/summary');
  };

  return (
    <BookingLayout currentStep={3}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>
          Passenger Details
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px' }}>
          Please provide information for all passengers traveling on this cruise
        </p>

        {/* Guest Count Selection */}
        <div style={{
          background: '#f9fafb',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a202c', marginBottom: '16px' }}>
            Number of Guests
          </h3>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                Adults (18+)
              </label>
              <select
                value={form.adults}
                onChange={handleAdultsChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  background: 'white',
                  color: '#1a202c'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                Children (Under 18)
              </label>
              <select
                value={form.children}
                onChange={handleChildrenChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  background: 'white',
                  color: '#1a202c'
                }}
              >
                {Array.from({ length: 7 - form.adults + 1 }, (_, i) => i).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
            Total guests: {form.adults + form.children} (Maximum 7 per booking)
          </div>
        </div>

        {/* Primary Passenger */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Primary Passenger
            </h3>
            <span style={{
              background: 'rgba(255,255,255,0.3)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Adult
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={form.primaryPassenger.fullName}
                onChange={handlePrimaryPassengerChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errors.primaryFullName ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1a202c'
                }}
              />
              {errors.primaryFullName && (
                <div style={{ color: '#fecaca', fontSize: '13px', marginTop: '4px' }}>{errors.primaryFullName}</div>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.primaryPassenger.email}
                onChange={handlePrimaryPassengerChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errors.primaryEmail ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1a202c'
                }}
              />
              {errors.primaryEmail && (
                <div style={{ color: '#fecaca', fontSize: '13px', marginTop: '4px' }}>{errors.primaryEmail}</div>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                Gender *
              </label>
              <select
                name="gender"
                value={form.primaryPassenger.gender}
                onChange={handlePrimaryPassengerChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errors.primaryGender ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1a202c'
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.primaryGender && (
                <div style={{ color: '#fecaca', fontSize: '13px', marginTop: '4px' }}>{errors.primaryGender}</div>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={form.primaryPassenger.age}
                onChange={handlePrimaryPassengerChange}
                min="18"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errors.primaryAge ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1a202c'
                }}
              />
              {errors.primaryAge && (
                <div style={{ color: '#fecaca', fontSize: '13px', marginTop: '4px' }}>{errors.primaryAge}</div>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                Citizenship *
              </label>
              <select
                name="citizenship"
                value={form.primaryPassenger.citizenship}
                onChange={handlePrimaryPassengerChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errors.primaryCitizenship ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1a202c'
                }}
              >
                <option value="">Select citizenship</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="Japan">Japan</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Other">Other</option>
              </select>
              {errors.primaryCitizenship && (
                <div style={{ color: '#fecaca', fontSize: '13px', marginTop: '4px' }}>{errors.primaryCitizenship}</div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Passengers */}
        {form.additionalPassengers.map((passenger, index) => (
          <div
            key={index}
            style={{
              background: '#f9fafb',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '2px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1a202c' }}>
                Passenger {index + 2}
              </h3>
              <span style={{
                background: passenger.isChild ? '#fcd34d' : '#7c4dff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: passenger.isChild ? '#78350f' : 'white'
              }}>
                {passenger.isChild ? 'Child' : 'Adult'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px', color: '#374151' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={passenger.fullName}
                  onChange={(e) => handleAdditionalPassengerChange(index, e)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors[`passenger${index}FullName`] ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '16px',
                    background: 'white',
                    color: '#1a202c'
                  }}
                />
                {errors[`passenger${index}FullName`] && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors[`passenger${index}FullName`]}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px', color: '#374151' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={passenger.gender}
                  onChange={(e) => handleAdditionalPassengerChange(index, e)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors[`passenger${index}Gender`] ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '16px',
                    background: 'white',
                    color: '#1a202c'
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors[`passenger${index}Gender`] && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors[`passenger${index}Gender`]}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px', color: '#374151' }}>
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={passenger.age}
                  onChange={(e) => handleAdditionalPassengerChange(index, e)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors[`passenger${index}Age`] ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '16px',
                    background: 'white',
                    color: '#1a202c'
                  }}
                />
                {errors[`passenger${index}Age`] && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors[`passenger${index}Age`]}</div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '14px', color: '#374151' }}>
                  Citizenship *
                </label>
                <select
                  name="citizenship"
                  value={passenger.citizenship}
                  onChange={(e) => handleAdditionalPassengerChange(index, e)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: errors[`passenger${index}Citizenship`] ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    fontSize: '16px',
                    background: 'white',
                    color: '#1a202c'
                  }}
                >
                  <option value="">Select citizenship</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="Japan">Japan</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
                {errors[`passenger${index}Citizenship`] && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors[`passenger${index}Citizenship`]}</div>
                )}
              </div>
            </div>
          </div>
        ))}

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
    </BookingLayout>
  );
};

export default PassengersPage;
