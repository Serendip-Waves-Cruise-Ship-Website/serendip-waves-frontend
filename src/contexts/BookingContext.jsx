import { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    cruise: null,
    passengers: [],
    cabin: null,
    payment: null,
    step: 'summary' // summary, passengers, cabin, payment, success
  });

  const updateBooking = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const setStep = (step) => {
    setBookingData(prev => ({ ...prev, step }));
  };

  const resetBooking = () => {
    setBookingData({
      cruise: null,
      passengers: [],
      cabin: null,
      payment: null,
      step: 'summary'
    });
  };

  const calculateTotal = () => {
    if (!bookingData.cruise || !bookingData.cabin) return 0;
    const basePrice = bookingData.cruise.price || 0;
    const cabinPrice = bookingData.cabin.price || 0;
    const numPassengers = bookingData.passengers.length || 1;
    return (basePrice + cabinPrice) * numPassengers;
  };

  const value = {
    bookingData,
    updateBooking,
    setStep,
    resetBooking,
    calculateTotal
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
