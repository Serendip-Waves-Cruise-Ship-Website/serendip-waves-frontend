import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';

const BookingSuccess = () => {
  const { bookingData, calculateTotal, resetBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingData.cruise || !bookingData.cabin || !bookingData.payment) {
      navigate('/booking');
    }
  }, [bookingData, navigate]);

  const handleNewBooking = () => {
    resetBooking();
    navigate('/booking');
  };

  const total = calculateTotal();

  return (
    <div className="booking-success text-center">
      <div className="card card-purple shadow-lg">
        <div className="card-body p-5">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
          <h1 className="text-success mb-3">Booking Confirmed!</h1>
          <p className="lead">Your cruise booking has been successfully processed.</p>
          
          <div className="card mt-4 mb-4">
            <div className="card-body text-start">
              <h5 className="card-title text-purple">Booking Details</h5>
              <hr />
              <div className="row mb-2">
                <div className="col-6"><strong>Cruise:</strong></div>
                <div className="col-6">{bookingData.cruise?.name}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong>Duration:</strong></div>
                <div className="col-6">{bookingData.cruise?.duration}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong>Destination:</strong></div>
                <div className="col-6">{bookingData.cruise?.destination}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong>Cabin Type:</strong></div>
                <div className="col-6">{bookingData.cabin?.type}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong>Passengers:</strong></div>
                <div className="col-6">{bookingData.passengers.length}</div>
              </div>
              <hr />
              <div className="row">
                <div className="col-6"><strong>Total Amount:</strong></div>
                <div className="col-6"><strong className="text-purple">${total.toFixed(2)} USD</strong></div>
              </div>
            </div>
          </div>

          <div className="alert alert-info">
            <strong>Confirmation email sent!</strong> You will receive a confirmation email with your booking details shortly.
          </div>

          <div className="mt-4">
            <button className="btn btn-gradient-purple me-2" onClick={handleNewBooking}>
              Book Another Cruise
            </button>
            <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
