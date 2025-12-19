import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPrint, FaDownload } from 'react-icons/fa';

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId, cabinNumber, email, bookingDetails } = location.state || {};
  const printRef = useRef();

  const generateBoardingPassHTML = () => {
    const bookingRef = bookingId ? `SW-${String(bookingId).padStart(6, '0')}` : 'XXXXXX';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Boarding Pass - ${bookingRef}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              background: #f5f5f5;
            }
            .boarding-pass { 
              background: white;
              border: 3px solid #667eea; 
              padding: 40px; 
              border-radius: 16px;
              max-width: 800px;
              margin: 0 auto;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #667eea; 
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header .subtitle {
              color: #6b7280;
              font-size: 16px;
            }
            .verified-badge {
              display: inline-block;
              background: #22c55e;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              margin-top: 10px;
            }
            .section {
              margin: 30px 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 12px 0; 
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label { 
              color: #6b7280;
              font-size: 15px;
            }
            .value { 
              font-weight: bold; 
              color: #1a202c;
              font-size: 15px;
            }
            .value.highlight {
              color: #22c55e;
              font-size: 18px;
            }
            .value.paid {
              color: #22c55e;
              font-weight: bold;
            }
            .barcode { 
              text-align: center; 
              margin: 30px 0;
              padding: 20px;
              background: #f9fafb;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
            }
            .barcode-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 10px;
            }
            .barcode-code { 
              font-size: 28px; 
              letter-spacing: 4px; 
              font-family: 'Courier New', monospace;
              font-weight: bold;
              color: #1a202c;
            }
            .passengers-list {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin-top: 10px;
            }
            .passenger-item {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .passenger-item:last-child {
              border-bottom: none;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 13px;
            }
            .important-notice {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .important-notice strong {
              color: #92400e;
            }
            @media print {
              body { background: white; padding: 20px; }
              .boarding-pass { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="boarding-pass">
            <div class="header">
              <h1>🌊 SERENDIP WAVES</h1>
              <div class="subtitle">Boarding Pass & Travel Document</div>
              <div class="verified-badge">✓ PAYMENT VERIFIED</div>
            </div>

            <div class="section">
              <div class="section-title">Passenger Information</div>
              <div class="detail-row">
                <span class="label">Passenger Name:</span>
                <span class="value">${bookingDetails?.fullName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">#${bookingId || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${email || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Booking Date:</span>
                <span class="value">${bookingDetails?.bookingDate || new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Cruise Details</div>
              <div class="detail-row">
                <span class="label">Ship Name:</span>
                <span class="value">${bookingDetails?.shipName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Destination:</span>
                <span class="value">${bookingDetails?.destination || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Departure Port:</span>
                <span class="value">${bookingDetails?.departurePort || 'TBD'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Departure Date:</span>
                <span class="value">${bookingDetails?.departureDate ? new Date(bookingDetails.departureDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Return Date:</span>
                <span class="value">${bookingDetails?.returnDate ? new Date(bookingDetails.returnDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Cabin Information</div>
              <div class="detail-row">
                <span class="label">Cabin Number:</span>
                <span class="value">${cabinNumber || 'TBD'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Cabin Type:</span>
                <span class="value">${bookingDetails?.cabinType || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Passengers:</span>
                <span class="value">${(bookingDetails?.adults || 0) + (bookingDetails?.children || 0)} (${bookingDetails?.adults || 0} Adult${(bookingDetails?.adults || 0) !== 1 ? 's' : ''}${bookingDetails?.children > 0 ? `, ${bookingDetails.children} Child${bookingDetails.children !== 1 ? 'ren' : ''}` : ''})</span>
              </div>
            </div>

            ${bookingDetails?.passengers && bookingDetails.passengers.length > 0 ? `
            <div class="section">
              <div class="section-title">All Passengers</div>
              <div class="passengers-list">
                ${bookingDetails.passengers.map((p, idx) => `
                  <div class="passenger-item">
                    <strong>${idx + 1}. ${p.fullName}</strong> - ${p.age} years, ${p.gender}, ${p.citizenship}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Payment Information</div>
              <div class="detail-row">
                <span class="label">Payment Status:</span>
                <span class="value paid">✓ ${bookingDetails?.paymentStatus || 'PAID'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount Paid:</span>
                <span class="value highlight">$${bookingDetails?.totalPrice || '0.00'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span class="value">Credit Card</span>
              </div>
            </div>

            <div class="barcode">
              <div class="barcode-label">BOOKING REFERENCE</div>
              <div class="barcode-code">${bookingRef}</div>
            </div>

            <div class="important-notice">
              <strong>Important:</strong> Please arrive at the departure port at least 2 hours before departure. Don't forget to bring your passport and this boarding pass. Have a wonderful cruise!
            </div>

            <div class="footer">
              <p><strong>Serendip Waves Cruise Line</strong></p>
              <p>For assistance, contact us at support@serendipwaves.com | +1 (555) 123-4567</p>
              <p style="margin-top: 10px; font-size: 11px;">This is your official boarding pass. Please keep it safe and present it at check-in.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const boardingPassHTML = generateBoardingPassHTML();
    const printWindow = window.open('', '', 'width=900,height=700');
    
    if (!printWindow) {
      alert('Please allow popups to print your boarding pass');
      return;
    }
    
    printWindow.document.write(boardingPassHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const handleDownload = () => {
    const boardingPassHTML = generateBoardingPassHTML();
    const downloadWindow = window.open('', '', 'width=900,height=700');
    
    if (!downloadWindow) {
      alert('Please allow popups to download your boarding pass');
      return;
    }
    
    downloadWindow.document.write(boardingPassHTML);
    downloadWindow.document.close();
    
    setTimeout(() => {
      downloadWindow.focus();
      downloadWindow.print();
    }, 250);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Success Animation */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '64px',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          ✓
        </div>

        <style>{`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#1a202c',
          marginBottom: '16px',
          animation: 'fadeInUp 0.6s ease-out 0.2s both'
        }}>
          Booking Confirmed!
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.6',
          animation: 'fadeInUp 0.6s ease-out 0.3s both'
        }}>
          Thank you for choosing Serendip Waves! Your cruise adventure awaits.
        </p>

        {/* Booking Details */}
        <div ref={printRef} style={{
          background: '#f9fafb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left',
          animation: 'fadeInUp 0.6s ease-out 0.4s both'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#7c4dff',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Boarding Pass & Booking Details
          </div>

          {bookingId && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Booking ID</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>#{bookingId}</span>
            </div>
          )}

          {bookingDetails?.fullName && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Passenger Name</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>{bookingDetails.fullName}</span>
            </div>
          )}

          {bookingDetails?.shipName && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Ship Name</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>{bookingDetails.shipName}</span>
            </div>
          )}

          {bookingDetails?.destination && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Destination</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>{bookingDetails.destination}</span>
            </div>
          )}

          {bookingDetails?.departurePort && bookingDetails.departurePort !== 'TBD' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Departure Port</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>{bookingDetails.departurePort}</span>
            </div>
          )}

          {bookingDetails?.departureDate && bookingDetails.departureDate !== 'TBD' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Departure Date</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>
                {new Date(bookingDetails.departureDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}

          {bookingDetails?.returnDate && bookingDetails.returnDate !== 'TBD' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Return Date</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>
                {new Date(bookingDetails.returnDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}

          {cabinNumber && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Cabin Number</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>{cabinNumber}</span>
            </div>
          )}

          {bookingDetails?.cabinType && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Cabin Type</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>{bookingDetails.cabinType}</span>
            </div>
          )}

          {(bookingDetails?.adults || bookingDetails?.children) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Passengers</span>
              <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '16px' }}>
                {bookingDetails.adults || 0} Adult{(bookingDetails.adults || 0) !== 1 ? 's' : ''}
                {bookingDetails.children > 0 && `, ${bookingDetails.children} Child${bookingDetails.children !== 1 ? 'ren' : ''}`}
              </span>
            </div>
          )}

          {bookingDetails?.totalPrice && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Total Amount Paid</span>
              <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '18px' }}>${bookingDetails.totalPrice}</span>
            </div>
          )}

          {bookingDetails?.paymentStatus && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Payment Status</span>
              <span style={{ 
                fontWeight: 700, 
                color: '#22c55e', 
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ {bookingDetails.paymentStatus}
              </span>
            </div>
          )}

          {email && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0'
            }}>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Confirmation sent to</span>
              <span style={{ fontWeight: 600, color: '#7c4dff', fontSize: '15px' }}>{email}</span>
            </div>
          )}

          {/* Barcode/Booking Reference */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px dashed #d1d5db'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Booking Reference</div>
            <div style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '3px', color: '#1a202c' }}>
              {bookingId ? `SW-${String(bookingId).padStart(6, '0')}` : 'XXXXXX'}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
          animation: 'fadeInUp 0.6s ease-out 0.5s both'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '24px' }}>📧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                Check Your Email
              </div>
              <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.5' }}>
                We've sent a detailed confirmation email with your cruise itinerary, booking details, and important travel information.
              </div>
            </div>
          </div>
        </div>

        {/* Print Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          animation: 'fadeInUp 0.6s ease-out 0.55s both'
        }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            }}
          >
            <FaPrint /> Print Boarding Pass
          </button>

          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <FaDownload /> Download Ticket
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'fadeInUp 0.6s ease-out 0.6s both'
        }}>
          <button
            onClick={() => navigate('/customer-dashboard')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#7c4dff';
              e.target.style.color = '#7c4dff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.color = '#374151';
            }}
          >
            Return to Home
          </button>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#fef3c7',
          borderRadius: '12px',
          animation: 'fadeInUp 0.6s ease-out 0.7s both'
        }}>
          <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
            <strong>Important:</strong> Please arrive at the departure port at least 2 hours before departure. Don't forget to bring your passport and booking confirmation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
