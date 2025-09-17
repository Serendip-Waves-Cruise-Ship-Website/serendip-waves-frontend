import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Table, Alert, Spinner, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaSwimmingPool, FaCheckCircle, FaClock, FaTimes, FaEye, FaTrash, FaExclamationTriangle, FaCreditCard, FaLock, FaArrowLeft } from 'react-icons/fa';
import FacilityBookingReceipt from './FacilityBookingReceipt';

const BookedFacilities = ({ bookingId, showTitle = true, onBookingUpdate }) => {
  const [bookedFacilities, setBookedFacilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardType: 'visa',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const fetchBookedFacilities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/Project-I/backend/getCustomerFacilityPreferences.php?booking_id=${bookingId}`);
      const data = await response.json();
      
      console.log('BookedFacilities API response:', data);
      
      if (data.success) {
        console.log('Booked facilities data:', data.preference);
        console.log('Passenger name in booked facilities:', data.preference?.passenger_name);
        setBookedFacilities(data.preference);
        
        // Notify parent component about the booking status
        if (onBookingUpdate && data.preference) {
          onBookingUpdate('status_loaded', data.preference);
        }
      } else {
        setError('No facility bookings found for this booking ID.');
      }
    } catch (error) {
      console.error('Error fetching booked facilities:', error);
      setError('Failed to load booked facilities.');
    } finally {
      setLoading(false);
    }
  }, [bookingId, onBookingUpdate]);

  useEffect(() => {
    if (bookingId) {
      fetchBookedFacilities();
    }
  }, [bookingId, fetchBookedFacilities]);

  const handleCancelBooking = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch('http://localhost/Project-I/backend/processFacilityBooking.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'cancel',
          selected_facilities: bookedFacilities.selected_facilities,
          quantities: bookedFacilities.quantities,
          total_cost: bookedFacilities.total_cost,
          passenger_email: bookedFacilities.passenger_email,
          passenger_name: bookedFacilities.passenger_name
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Booking cancelled successfully! Email confirmation sent.');
        // Refresh the data
        fetchBookedFacilities();
        setShowCancelModal(false);
        
        // Notify parent component if callback provided
        if (onBookingUpdate) {
          onBookingUpdate('cancelled', data);
        }
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCardDetailsChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCardDetails = () => {
    const { cardType, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardDetails;
    
    if (!cardType) {
      alert('Please select a card type');
      return false;
    }
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      alert('Please enter card expiry date');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      alert('Please enter a valid CVV');
      return false;
    }
    if (!cardholderName.trim()) {
      alert('Please enter cardholder name');
      return false;
    }
    
    return true;
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return numericValue.replace(/(.{4})/g, '$1 ').trim();
  };

  const handlePayNowClick = () => {
    setShowPaymentModal(true);
    setShowCardDetails(true);
  };

  const handleCompletePayment = async () => {
    if (!validateCardDetails()) {
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await fetch('http://localhost/Project-I/backend/processFacilityBooking.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'confirm',
          selected_facilities: bookedFacilities.selected_facilities,
          quantities: bookedFacilities.quantities,
          total_cost: bookedFacilities.total_cost,
          passenger_email: bookedFacilities.passenger_email,
          passenger_name: bookedFacilities.passenger_name,
          card_details: cardDetails
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Payment completed successfully! Confirmation email sent.');
        // Reset form and close modal
        setShowPaymentModal(false);
        setShowCardDetails(false);
        setCardDetails({
          cardType: 'visa',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: ''
        });
        
        // Refresh the data to show updated status
        fetchBookedFacilities();
        
        // Notify parent component if callback provided
        if (onBookingUpdate) {
          onBookingUpdate('payment_completed', data);
        }
      } else {
        alert('Error processing payment: ' + data.message);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setShowCardDetails(false);
    setCardDetails({
      cardType: 'visa',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <FaCheckCircle className="me-1" />;
      case 'pending': return <FaClock className="me-1" />;
      case 'cancelled': return <FaTimes className="me-1" />;
      default: return <FaEye className="me-1" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Confirmed & Paid';
      case 'pending': return 'Pending Payment';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-0">Loading booked facilities...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info" className="mb-0">
            <FaSwimmingPool className="me-2" />
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!bookedFacilities || !bookedFacilities.facility_details || bookedFacilities.facility_details.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info" className="mb-0">
            <FaSwimmingPool className="me-2" />
            No facilities booked yet. Add some exciting facilities to your cruise experience!
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-sm">
      {showTitle && (
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaSwimmingPool className="me-2" />
            Your Booked Facilities
          </h5>
        </Card.Header>
      )}
      
      <Card.Body>
        {/* Booking Status */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>Booking ID:</strong> {bookedFacilities.booking_id}
            <span className="ms-3">
              <strong>Primary Guest:</strong> {bookedFacilities.passenger_name || 'Guest'}
            </span>
          </div>
          <Badge 
            bg={getStatusColor(bookedFacilities.payment_status)} 
            className="fs-6 px-3 py-2"
          >
            {getStatusIcon(bookedFacilities.payment_status)}
            {getStatusText(bookedFacilities.payment_status)}
          </Badge>
        </div>

        {/* Trip Information */}
        {bookedFacilities.departure_date && (
          <div className="mb-3 p-2 bg-light rounded">
            <strong>Trip Details:</strong>
            <div className="row">
              <div className="col-md-4">
                <small className="text-muted">Departure:</small><br />
                <strong>{new Date(bookedFacilities.departure_date).toLocaleDateString()}</strong>
              </div>
              <div className="col-md-4">
                <small className="text-muted">Return:</small><br />
                <strong>{new Date(bookedFacilities.return_date).toLocaleDateString()}</strong>
              </div>
              <div className="col-md-4">
                <small className="text-muted">Duration:</small><br />
                <strong>{bookedFacilities.trip_duration} days</strong>
              </div>
            </div>
          </div>
        )}

        {/* Facilities Table */}
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="table-primary">
              <tr>
                <th>Facility</th>
                <th>Booking Session</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookedFacilities.facility_details.map((facility, index) => (
                <tr key={index} className={facility.payment_status === 'pending' ? 'table-warning' : facility.payment_status === 'paid' ? 'table-success' : ''}>
                  <td>
                    <strong>{facility.name}</strong>
                  </td>
                  <td className="text-center">
                    <Badge bg={facility.payment_status === 'paid' ? 'success' : 'warning'}>
                      #{facility.session_index || 1}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary">{facility.quantity}</Badge>
                  </td>
                  <td className="text-end">
                    ${facility.unit_price.toFixed(2)} {facility.unit_text}
                  </td>
                  <td className="text-end">
                    <strong>${facility.total_price.toFixed(2)}</strong>
                  </td>
                  <td className="text-center">
                    <Badge bg={facility.payment_status === 'paid' ? 'success' : 'warning'}>
                      {facility.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-warning">
              {/* Show breakdown if there are paid and pending amounts */}
              {bookedFacilities.paid_amount > 0 && bookedFacilities.pending_amount > 0 ? (
                <>
                  <tr>
                    <th colSpan="3" className="text-end">Paid Amount:</th>
                    <th className="text-end text-success">
                      ${parseFloat(bookedFacilities.paid_amount).toFixed(2)}
                    </th>
                  </tr>
                  <tr>
                    <th colSpan="3" className="text-end">Pending Amount:</th>
                    <th className="text-end text-warning">
                      ${parseFloat(bookedFacilities.pending_amount).toFixed(2)}
                    </th>
                  </tr>
                  <tr className="table-active">
                    <th colSpan="3" className="text-end">Total Amount:</th>
                    <th className="text-end">
                      <h5 className="text-primary mb-0">
                        ${parseFloat(bookedFacilities.total_cost).toFixed(2)}
                      </h5>
                    </th>
                  </tr>
                </>
              ) : (
                <tr>
                  <th colSpan="3" className="text-end">Total Amount:</th>
                  <th className="text-end">
                    <h5 className="text-primary mb-0">
                      ${parseFloat(bookedFacilities.total_cost).toFixed(2)}
                    </h5>
                  </th>
                </tr>
              )}
            </tfoot>
          </Table>
        </div>

        {/* Action Buttons for Pending Bookings */}
        {(bookedFacilities.payment_status === 'pending' || bookedFacilities.payment_status === 'partial') && 
         !bookedFacilities.journey_completed && 
         bookedFacilities.pending_amount > 0 && (
          <div className="mt-3">
            <Alert variant="warning">
              <strong>Payment Required:</strong> {bookedFacilities.payment_status === 'partial' ? 'Complete your remaining payment to confirm these facilities.' : 'Complete your payment to confirm these facilities.'}
            </Alert>
            <div className="d-flex gap-2 flex-wrap">
              <Button 
                variant="success" 
                size="sm"
                onClick={handlePayNowClick}
                disabled={paymentLoading}
              >
                <FaCheckCircle className="me-1" />
                {bookedFacilities.pending_amount > 0 ? 
                  `Pay Pending $${parseFloat(bookedFacilities.pending_amount).toFixed(2)}` : 
                  'Complete Payment'
                }
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => window.location.href = `/facilities/${bookingId}`}
              >
                Modify Booking
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelLoading}
              >
                <FaTrash className="me-1" />
                Cancel Booking
              </Button>
            </div>
          </div>
        )}

        {/* Message for Completed Payments (partial status but no pending amount) */}
        {bookedFacilities.payment_status === 'partial' && 
         bookedFacilities.pending_amount <= 0 && 
         !bookedFacilities.journey_completed && (
          <div className="mt-3">
            <Alert variant="success">
              <strong>✅ All Payments Completed:</strong> All your facility bookings have been paid and confirmed. You can view your complete booking details below.
            </Alert>
            <div className="d-flex gap-2 flex-wrap">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowReceiptModal(true)}
              >
                <FaEye className="me-1" />
                View Complete Receipt
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons for Confirmed Bookings */}
        {bookedFacilities.payment_status === 'paid' && !bookedFacilities.journey_completed && (
          <div className="mt-3">
            <Alert variant="success">
              <strong>✅ Booking Confirmed & Paid:</strong> Your facilities are confirmed and payment has been processed successfully. You can view your booking details below.
            </Alert>
            <div className="d-flex gap-2 flex-wrap">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowReceiptModal(true)}
              >
                <FaEye className="me-1" />
                View Booking Receipt
              </Button>
            </div>
            <div className="mt-2">
              <small className="text-muted">
                <strong>Note:</strong> This booking has been confirmed and paid. For any changes or assistance, please contact our customer service team.
              </small>
            </div>
          </div>
        )}

        {/* Journey Completed Notice */}
        {bookedFacilities.journey_completed && (
          <Alert variant="info" className="mt-3 mb-0">
            <FaCheckCircle className="me-2" />
            <strong>Journey Completed:</strong> Thank you for choosing our facilities! We hope you had a wonderful experience.
          </Alert>
        )}

        {/* Booking Details */}
        <div className="mt-3">
          <small className="text-muted">
            <strong>Booked on:</strong> {new Date(bookedFacilities.created_at).toLocaleString()}
            {bookedFacilities.updated_at !== bookedFacilities.created_at && (
              <>
                <br />
                <strong>Last updated:</strong> {new Date(bookedFacilities.updated_at).toLocaleString()}
              </>
            )}
          </small>
        </div>
      </Card.Body>

      {/* Cancel Booking Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Cancel Facility Booking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>⚠️ Are you sure you want to cancel this booking?</strong>
          </Alert>
          
          <p>This action will:</p>
          <ul>
            <li>❌ Cancel all selected facilities for booking <strong>{bookingId}</strong></li>
            <li>📧 Send a cancellation email confirmation</li>
            {bookedFacilities?.payment_status === 'paid' && (
              <li>💰 Process a refund within 5-7 business days</li>
            )}
            <li>🔄 Allow you to make new facility bookings if needed</li>
          </ul>

          {bookedFacilities?.facility_details && bookedFacilities.facility_details.length > 0 && (
            <div className="mt-3">
              <strong>Facilities to be cancelled:</strong>
              <ul className="mt-2">
                {bookedFacilities.facility_details.map((facility, index) => (
                  <li key={index}>
                    {facility.name} (Quantity: {facility.quantity}) - ${facility.total_price.toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="text-end">
                <strong>Total Amount: ${parseFloat(bookedFacilities.total_cost).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelModal(false)}
            disabled={cancelLoading}
          >
            Keep Booking
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelBooking}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Yes, Cancel Booking
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Facility Booking Receipt Modal */}
      <FacilityBookingReceipt 
        show={showReceiptModal}
        onHide={() => setShowReceiptModal(false)}
        bookingId={bookingId}
      />

      {/* Payment Modal with Card Details */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {showCardDetails ? (
              <>
                <FaLock className="me-2" />
                Secure Payment Details
              </>
            ) : (
              <>
                <FaCheckCircle className="me-2" />
                Complete Payment
              </>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Order Summary - Compact */}
          <Alert variant="success" className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Total Amount: ${parseFloat(bookedFacilities?.total_cost || 0).toFixed(2)}</strong>
                <br />
                <small>{bookedFacilities?.facility_details?.length || 0} facility item{(bookedFacilities?.facility_details?.length || 0) > 1 ? 's' : ''} | Booking ID: {bookingId}</small>
              </div>
              <FaCheckCircle size={24} />
            </div>
          </Alert>

          {/* Card Details Form */}
          {showCardDetails && (
            <Form>
              {/* Card Type Selection */}
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold mb-3">
                      <FaCreditCard className="me-2" />
                      Select Card Type *
                    </Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        id="visa-booked"
                        name="cardType"
                        value="visa"
                        checked={cardDetails.cardType === 'visa'}
                        onChange={(e) => handleCardDetailsChange('cardType', e.target.value)}
                        label={
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-2 px-3 py-1 rounded" 
                              style={{ 
                                backgroundColor: '#1a1f71', 
                                color: 'white', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}
                            >
                              VISA
                            </div>
                            Visa
                          </div>
                        }
                      />
                      <Form.Check
                        type="radio"
                        id="mastercard-booked"
                        name="cardType"
                        value="mastercard"
                        checked={cardDetails.cardType === 'mastercard'}
                        onChange={(e) => handleCardDetailsChange('cardType', e.target.value)}
                        label={
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-2 px-2 py-1 rounded d-flex"
                              style={{ 
                                backgroundColor: '#eb001b', 
                                color: 'white', 
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}
                            >
                              <span style={{ backgroundColor: '#ff5f00', padding: '0 2px', marginRight: '2px', borderRadius: '2px' }}>●</span>
                              <span>MC</span>
                            </div>
                            Mastercard
                          </div>
                        }
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Card Number *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardDetailsChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Expiry Month *</Form.Label>
                    <Form.Select
                      value={cardDetails.expiryMonth}
                      onChange={(e) => handleCardDetailsChange('expiryMonth', e.target.value)}
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Expiry Year *</Form.Label>
                    <Form.Select
                      value={cardDetails.expiryYear}
                      onChange={(e) => handleCardDetailsChange('expiryYear', e.target.value)}
                      required
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>CVV *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardDetailsChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Cardholder Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.cardholderName}
                      onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}

          {/* Security Info */}
          <Alert variant="light" className="mt-3">
            <FaLock className="me-2" />
            <small>
              Your payment information is secure and encrypted. We do not store card details.
            </small>
          </Alert>

          {/* Payment Action Buttons */}
          <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={handleClosePaymentModal}
              disabled={paymentLoading}
              className="me-md-2"
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>

            <Button
              variant="success"
              size="lg"
              onClick={handleCompletePayment}
              disabled={paymentLoading}
              className="me-md-2"
            >
              {paymentLoading ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FaLock className="me-2" />
              )}
              {bookedFacilities?.pending_amount > 0 ? 
                `Complete Payment $${parseFloat(bookedFacilities.pending_amount).toFixed(2)}` :
                `Complete Payment $${parseFloat(bookedFacilities?.total_cost || 0).toFixed(2)}`
              }
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default BookedFacilities;
