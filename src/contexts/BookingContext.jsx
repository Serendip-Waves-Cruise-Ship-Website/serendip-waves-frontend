import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    // Step 1: Cruise Selection
    destination: '',
    ship_id: null,
    ship_name: '',
    itinerary_id: null,
    start_date: '',
    end_date: '',
    duration_days: 0,
    
    // Step 2: Passengers
    adults: 1,
    children: 0,
    primaryPassenger: {
      fullName: '',
      gender: '',
      citizenship: '',
      email: '',
      age: '',
    },
    additionalPassengers: [],
    
    // Step 3: Cabin Selection
    cabinType: '',
    totalPrice: 0,
    
    // Step 4: Payment
    cardType: 'Visa',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const updateBookingData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const resetBooking = () => {
    setBookingData({
      destination: '',
      ship_id: null,
      ship_name: '',
      itinerary_id: null,
      start_date: '',
      end_date: '',
      duration_days: 0,
      adults: 1,
      children: 0,
      primaryPassenger: {
        fullName: '',
        gender: '',
        citizenship: '',
        email: '',
        age: '',
      },
      additionalPassengers: [],
      cabinType: '',
      totalPrice: 0,
      cardType: 'Visa',
      cardNumber: '',
      expiry: '',
      cvv: '',
    });
  };

  const value = {
    bookingData,
    updateBookingData,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
