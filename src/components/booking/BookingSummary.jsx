import { useBooking } from '../../contexts/BookingContext';

const BookingSummary = ({ onNext }) => {
  const { bookingData, updateBooking } = useBooking();

  const handleSelectCruise = (cruise) => {
    updateBooking({ cruise });
    onNext();
  };

  const mockCruises = [
    {
      id: 1,
      name: 'Caribbean Paradise',
      duration: '7 Days',
      price: 1200,
      destination: 'Caribbean Islands',
      description: 'Explore the beautiful Caribbean islands'
    },
    {
      id: 2,
      name: 'Mediterranean Dream',
      duration: '10 Days',
      price: 1800,
      destination: 'Mediterranean',
      description: 'Discover the Mediterranean coast'
    },
    {
      id: 3,
      name: 'Alaska Adventure',
      duration: '14 Days',
      price: 2500,
      destination: 'Alaska',
      description: 'Experience the wilderness of Alaska'
    }
  ];

  return (
    <div className="booking-summary">
      <h2 className="mb-4 text-purple">Select Your Cruise</h2>
      <div className="row">
        {mockCruises.map(cruise => (
          <div key={cruise.id} className="col-md-6 col-lg-4 mb-4">
            <div className={`card h-100 card-purple ${bookingData.cruise?.id === cruise.id ? 'border-primary' : ''}`}>
              <div className="card-body">
                <h5 className="card-title text-purple">{cruise.name}</h5>
                <p className="card-text">{cruise.description}</p>
                <ul className="list-unstyled">
                  <li><strong>Duration:</strong> {cruise.duration}</li>
                  <li><strong>Destination:</strong> {cruise.destination}</li>
                  <li><strong>Price:</strong> ${cruise.price.toFixed(2)} USD per person</li>
                </ul>
              </div>
              <div className="card-footer bg-white">
                <button
                  className="btn btn-gradient-purple w-100"
                  onClick={() => handleSelectCruise(cruise)}
                >
                  Select Cruise
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSummary;
