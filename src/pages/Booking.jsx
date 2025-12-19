import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import BookingSummary from '../components/booking/BookingSummary';
import PassengerForm from '../components/booking/PassengerForm';
import CabinSelection from '../components/booking/CabinSelection';
import PaymentForm from '../components/booking/PaymentForm';

const Booking = () => {
  const { bookingData, setStep } = useBooking();
  const navigate = useNavigate();

  const steps = useMemo(() => [
    { name: 'Summary', component: BookingSummary },
    { name: 'Passengers', component: PassengerForm },
    { name: 'Cabin', component: CabinSelection },
    { name: 'Payment', component: PaymentForm }
  ], []);

  const currentStep = useMemo(() => {
    const stepIndex = steps.findIndex(s => s.name.toLowerCase() === bookingData.step);
    return stepIndex !== -1 ? stepIndex : 0;
  }, [bookingData.step, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setStep(steps[nextStep].name.toLowerCase());
    } else {
      setStep('success');
      navigate('/booking/success');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setStep(steps[prevStep].name.toLowerCase());
    }
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="booking-page">
      <div className="container my-5">
        <div className="booking-steps mb-5">
          {steps.map((step, index) => (
            <div 
              key={step.name}
              className={`booking-step ${
                index === currentStep ? 'active' : 
                index < currentStep ? 'completed' : ''
              }`}
            >
              <div className="fw-bold">{index + 1}</div>
              <div>{step.name}</div>
            </div>
          ))}
        </div>

        <CurrentComponent onNext={handleNext} onBack={handleBack} />
      </div>
    </div>
  );
};

export default Booking;
