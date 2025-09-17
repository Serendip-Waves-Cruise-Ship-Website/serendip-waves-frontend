import React, { useState } from 'react';
import { Modal, Button, Alert, Table, Badge, Spinner, Form, Row, Col } from 'react-bootstrap';
import { FaCreditCard, FaSave, FaTimes, FaCheckCircle, FaLock, FaArrowLeft } from 'react-icons/fa';

const FacilityBookingConfirmation = ({ 
  show, 
  onHide, 
  bookingId, 
  passengerEmail, 
  passengerName,
  selectedFacilities, 
  quantities, 
  facilities,
  totalCost,
  onBookingComplete 
}) => {
  console.log('FacilityBookingConfirmation props:', { bookingId, passengerName, passengerEmail });
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState('');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardType: 'visa',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  // Get selected facility details using dynamic facilities data
  const facilityDetails = Object.keys(selectedFacilities)
    .filter(key => selectedFacilities[key])
    .map(facilityCode => {
      const facility = facilities[facilityCode];
      if (!facility) {
        console.error(`Facility not found for code: ${facilityCode}`);
        return null;
      }
      
      const quantity = quantities[facilityCode] || 1;
      
      // Direct calculation - quantity represents days for paid facilities
      let quantityText = '';
      
      if (facility.price === 0) {
        quantityText = 'Free Access';
      } else {
        quantityText = `${quantity} day${quantity > 1 ? 's' : ''}`;
      }
      
      const totalPrice = facility.price * quantity;
      
      return {
        code: facilityCode,
        name: facility.name,
        quantity: quantity,
        quantityText: quantityText,
        unitPrice: facility.price,
        totalPrice,
        unit: facility.unit || 'access',
        unitText: facility.unitText || (facility.price > 0 ? `per ${facility.unit || 'access'}` : 'Free')
      };
    })
    .filter(detail => detail !== null); // Remove null entries

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
    setShowCardDetails(true);
  };

  const handleConfirmPayment = async () => {
    if (!validateCardDetails()) {
      return;
    }
    
    await handleAction('confirm');
  };

  const handleAction = async (action) => {
    setLoading(true);
    setActionType(action);

    try {
      const response = await fetch('http://localhost/Project-I/backend/processFacilityBooking.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action: action,
          selected_facilities: selectedFacilities,
          quantities: quantities,
          total_cost: totalCost,
          passenger_email: passengerEmail,
          passenger_name: passengerName,
          card_details: action === 'confirm' ? cardDetails : null
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success message based on action and email status
        let successMessage = '';
        switch (action) {
          case 'confirm':
            if (data.email_sent === true) {
              successMessage = '✅ Payment confirmed! Email confirmation sent.';
            } else if (data.email_sent === false) {
              successMessage = '✅ Payment confirmed! (Email delivery failed - please save this confirmation)';
            } else {
              successMessage = '✅ Payment confirmed successfully!';
            }
            break;
          case 'save_pending':
            if (data.email_sent === true) {
              successMessage = '💾 Booking saved as pending! Email notification sent.';
            } else if (data.email_sent === false) {
              successMessage = '💾 Booking saved as pending! (Email delivery failed)';
            } else {
              successMessage = '💾 Booking saved as pending!';
            }
            break;
          case 'cancel':
            if (data.email_sent === true) {
              successMessage = '❌ Booking cancelled! Email notification sent.';
            } else if (data.email_sent === false) {
              successMessage = '❌ Booking cancelled! (Email delivery failed)';
            } else {
              successMessage = '❌ Booking cancelled!';
            }
            break;
        }

        alert(successMessage);
        
        // Call parent callback to refresh data and let it handle modal closure
        if (onBookingComplete) {
          onBookingComplete(action, data);
        }
        
        // Close modal immediately after parent callback
        onHide();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to process booking. Please try again.');
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  const handleModalClose = () => {
    // Reset card details and step when modal is closed
    setShowCardDetails(false);
    setCardDetails({
      cardType: 'visa',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: ''
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="lg" centered>
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
              Confirm Facility Booking
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!showCardDetails ? (
          // Booking Confirmation View
          <>
            <Alert variant="info">
              <h5>🎢 Do you want to add these facilities to your booking?</h5>
              <p className="mb-0">
                <strong>Booking ID:</strong> {bookingId} | 
                <strong> Passenger:</strong> {passengerName}
              </p>
            </Alert>

            {/* Facility Details Table */}
            <div className="mb-4">
              <h6>📋 Selected Facilities:</h6>
              <Table striped bordered hover size="sm">
                <thead className="table-primary">
                  <tr>
                    <th>Facility</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityDetails.map((facility, index) => (
                    <tr key={index}>
                      <td>{facility.name}</td>
                      <td className="text-center">
                        <Badge bg="secondary">{facility.quantityText}</Badge>
                      </td>
                      <td className="text-end">
                        {facility.unitText}
                      </td>
                      <td className="text-end">
                        <strong>${facility.totalPrice.toFixed(2)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-warning">
                  <tr>
                    <th colSpan="3">Total Amount:</th>
                    <th className="text-end">
                      <h5 className="text-primary mb-0">
                        ${totalCost.toFixed(2)}
                      </h5>
                    </th>
                  </tr>
                </tfoot>
              </Table>
            </div>

            {/* Email Notification Info */}
            <Alert variant="light">
              <small>
                📧 An email confirmation will be sent to: <strong>{passengerEmail}</strong>
              </small>
            </Alert>

            {/* Action Buttons */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button
                variant="success"
                size="lg"
                onClick={handlePayNowClick}
                disabled={loading}
                className="me-md-2"
              >
                <FaCreditCard className="me-2" />
                Pay Now ${totalCost.toFixed(2)}
              </Button>

              <Button
                variant="warning"
                size="lg"
                onClick={() => handleAction('save_pending')}
                disabled={loading}
                className="me-md-2"
              >
                {loading && actionType === 'save_pending' ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaSave className="me-2" />
                )}
                Save as Pending
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleModalClose}
                disabled={loading}
              >
                Close
              </Button>
            </div>
          </>
        ) : (
          // Card Details View
          <>
            {/* Order Summary - Compact */}
            <Alert variant="success" className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Order Total: ${totalCost.toFixed(2)}</strong>
                  <br />
                  <small>{facilityDetails.length} facility item{facilityDetails.length > 1 ? 's' : ''} | Booking ID: {bookingId}</small>
                </div>
                <FaCheckCircle size={24} />
              </div>
            </Alert>

            {/* Card Details Form */}
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
                        id="visa"
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
                        id="mastercard"
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
                onClick={() => setShowCardDetails(false)}
                disabled={loading}
                className="me-md-2"
              >
                <FaArrowLeft className="me-2" />
                Back to Order
              </Button>

              <Button
                variant="success"
                size="lg"
                onClick={handleConfirmPayment}
                disabled={loading}
                className="me-md-2"
              >
                {loading && actionType === 'confirm' ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaLock className="me-2" />
                )}
                Complete Payment ${totalCost.toFixed(2)}
              </Button>
            </div>
          </>
        )}

        {/* Additional Info */}
        <div className="mt-3">
          <small className="text-muted">
            <strong>Note:</strong> 
            <ul className="mt-2">
              <li><strong>Pay Now:</strong> Confirms and processes payment immediately</li>
              <li><strong>Save as Pending:</strong> Saves your selection for later payment</li>
            </ul>
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FacilityBookingConfirmation;
