import { useState } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';

const PaymentForm = ({ onNext, onBack }) => {
  const { bookingData, updateBooking, calculateTotal } = useBooking();
  const { showError, showSuccess } = useToast();
  const [paymentInfo, setPaymentInfo] = useState(bookingData.payment || {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const handleChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || 
        !paymentInfo.cvv || !paymentInfo.billingAddress || !paymentInfo.city || 
        !paymentInfo.zipCode || !paymentInfo.country) {
      showError('Please fill all payment fields');
      return false;
    }

    if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      showError('Invalid card number');
      return false;
    }

    if (paymentInfo.cvv.length !== 3 && paymentInfo.cvv.length !== 4) {
      showError('Invalid CVV');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateBooking({ payment: paymentInfo });
      showSuccess('Payment processed successfully');
      onNext();
    }
  };

  const total = calculateTotal();

  return (
    <div className="payment-form">
      <h2 className="mb-4 text-purple">Payment Information</h2>
      
      <div className="card mb-4 card-purple">
        <div className="card-body">
          <h5 className="card-title">Booking Summary</h5>
          <table className="table table-sm">
            <tbody>
              <tr>
                <td>Cruise:</td>
                <td><strong>{bookingData.cruise?.name}</strong></td>
              </tr>
              <tr>
                <td>Cabin Type:</td>
                <td><strong>{bookingData.cabin?.type}</strong></td>
              </tr>
              <tr>
                <td>Passengers:</td>
                <td><strong>{bookingData.passengers.length}</strong></td>
              </tr>
              <tr className="border-top">
                <td><strong>Total Amount:</strong></td>
                <td><strong className="text-purple">${total.toFixed(2)} USD</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card card-purple">
          <div className="card-body">
            <h5 className="card-title mb-4">Payment Details</h5>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Cardholder Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.cardName}
                  onChange={(e) => handleChange('cardName', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-8 mb-3">
                <label className="form-label">Card Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => handleChange('cardNumber', e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Expiry *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => handleChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">CVV *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.cvv}
                  onChange={(e) => handleChange('cvv', e.target.value)}
                  maxLength="4"
                  required
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Billing Address *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.billingAddress}
                  onChange={(e) => handleChange('billingAddress', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">ZIP Code *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentInfo.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn btn-gradient-purple">
            Complete Booking - ${total.toFixed(2)} USD
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
