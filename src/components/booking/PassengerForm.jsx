import { useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';

const PassengerForm = ({ onNext, onBack }) => {
  const { bookingData, updateBooking } = useBooking();
  const { showError, showSuccess } = useToast();
  const [passengers, setPassengers] = useState(bookingData.passengers.length > 0 ? bookingData.passengers : [
    { firstName: '', lastName: '', email: '', phone: '', age: '' }
  ]);

  const handleAddPassenger = () => {
    setPassengers([...passengers, { firstName: '', lastName: '', email: '', phone: '', age: '' }]);
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    } else {
      showError('At least one passenger is required');
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const validateForm = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.email || !p.phone || !p.age) {
        showError(`Please fill all fields for passenger ${i + 1}`);
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(p.email)) {
        showError(`Invalid email for passenger ${i + 1}`);
        return false;
      }
      if (p.age < 1 || p.age > 120) {
        showError(`Invalid age for passenger ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateBooking({ passengers });
      showSuccess('Passenger information saved');
      onNext();
    }
  };

  return (
    <div className="passenger-form">
      <h2 className="mb-4 text-purple">Passenger Information</h2>
      <form onSubmit={handleSubmit}>
        {passengers.map((passenger, index) => (
          <div key={index} className="card mb-3 card-purple">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Passenger {index + 1}</h5>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemovePassenger(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={passenger.phone}
                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          className="btn btn-outline-primary mb-3"
          onClick={handleAddPassenger}
        >
          + Add Another Passenger
        </button>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn btn-gradient-purple">
            Continue to Cabin Selection
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerForm;
