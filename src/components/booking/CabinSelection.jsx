import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';

const CabinSelection = ({ onNext, onBack }) => {
  const { bookingData, updateBooking } = useBooking();
  const { showSuccess } = useToast();

  const cabinTypes = [
    {
      id: 1,
      type: 'Interior',
      price: 0,
      description: 'Cozy interior cabin with all amenities',
      features: ['Queen bed', 'Private bathroom', 'TV', 'Mini-fridge']
    },
    {
      id: 2,
      type: 'Ocean View',
      price: 200,
      description: 'Cabin with a window overlooking the ocean',
      features: ['Queen bed', 'Private bathroom', 'TV', 'Mini-fridge', 'Ocean view window']
    },
    {
      id: 3,
      type: 'Balcony',
      price: 400,
      description: 'Spacious cabin with private balcony',
      features: ['Queen bed', 'Private bathroom', 'TV', 'Mini-fridge', 'Private balcony', 'Seating area']
    },
    {
      id: 4,
      type: 'Suite',
      price: 800,
      description: 'Luxury suite with premium amenities',
      features: ['King bed', 'Premium bathroom', 'TV', 'Full bar', 'Large balcony', 'Living room', 'Concierge service']
    }
  ];

  const handleSelectCabin = (cabin) => {
    updateBooking({ cabin });
    showSuccess('Cabin selected successfully');
    onNext();
  };

  return (
    <div className="cabin-selection">
      <h2 className="mb-4 text-purple">Select Your Cabin</h2>
      <div className="row">
        {cabinTypes.map(cabin => (
          <div key={cabin.id} className="col-md-6 mb-4">
            <div className={`card h-100 card-purple ${bookingData.cabin?.id === cabin.id ? 'border-primary border-3' : ''}`}>
              <div className="card-body">
                <h5 className="card-title text-purple">{cabin.type}</h5>
                <p className="card-text">{cabin.description}</p>
                <h6>Features:</h6>
                <ul>
                  {cabin.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <strong className="text-purple">Additional Price: ${cabin.price.toFixed(2)} USD per person</strong>
                </div>
              </div>
              <div className="card-footer bg-white">
                <button
                  className="btn btn-gradient-purple w-100"
                  onClick={() => handleSelectCabin(cabin)}
                >
                  Select {cabin.type}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default CabinSelection;
