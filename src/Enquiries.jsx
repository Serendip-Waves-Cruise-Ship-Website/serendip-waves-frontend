/**
 * Enquiries.jsx - now fetches and deletes from backend
 */
import React, { useEffect, useState, useContext } from 'react';
import { Table, Modal, Button, Spinner, Alert } from 'react-bootstrap';
import './Enquiries.css';
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';

const BACKEND = 'http://localhost/Project-I/backend';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null); // id of deleting row
  const { logout } = useContext(AuthContext);
  const [replyModal, setReplyModal] = useState({ show: false, email: '', name: '', id: null });
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch all enquiries
  const fetchEnquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND}/getEnquiries.php`);
      const data = await res.json();
      if (data.status === 'success') {
        setEnquiries(data.enquiries);
      } else {
        setError(data.message || 'Failed to fetch enquiries.');
      }
    } catch {
      setError('Failed to fetch enquiries.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleOpenReply = (enq) => {
    setReplyModal({ show: true, email: enq.email, name: enq.name, id: enq.id });
    setReplyMessage('');
    setReplyError('');
    setReplySuccess('');
  };
  const handleCloseReply = () => {
    setReplyModal({ show: false, email: '', name: '', id: null });
    setReplyMessage('');
    setReplyError('');
    setReplySuccess('');
  };
  const handleSendReply = async () => {
    setReplyLoading(true);
    setReplyError("");
    setReplySuccess("");
    try {
      // Debug: log payload to ensure 'to' is set
      const payload = {
        to: replyModal.email,
        subject: 'Reply to your enquiry at Serendip Waves',
        message: replyMessage,
        name: replyModal.name
      };
      console.log('Reply payload:', payload);
      const res = await fetch('http://localhost/Project-I/backend/replyEnquiry.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setReplySuccess('Message sent successfully!');
        setReplyMessage('');
        // Keep modal open for a moment to show success
        setTimeout(() => {
          setReplyModal({ show: false, email: '', name: '', id: null });
          setReplySuccess('');
        }, 1500);
      } else {
        setReplyError(data.message || 'Failed to send reply.');
      }
    } catch {
      setReplyError('Network error. Please try again.');
    }
    setReplyLoading(false);
  };

  // Delete an enquiry
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    setDeleteLoading(id);
    setError('');
    try {
      const res = await fetch(`${BACKEND}/deleteEnquiries.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(id)}`,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEnquiries(enquiries.filter(e => e.id !== id));
      } else {
        setError(data.message || 'Failed to delete enquiry.');
      }
    } catch {
      setError('Failed to delete enquiry.');
    }
    setDeleteLoading(null);
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    logout();
    window.location.href = '/';
    setShowLogoutModal(false);
  };

  return (
    <div className="enquiries-dashboard-bg">
      {/* Custom Navbar/Header */}
      <div className="enquiries-header-bar">
        <div className="enquiries-header-left">
          <img src={logo} alt="Logo" className="enquiries-logo" onClick={() => window.location.href = '/#top'} />
          <div className="enquiries-title">Enquiries</div>
        </div>
        <button onClick={handleLogoutClick} className="enquiries-logout-btn">Logout</button>
      </div>
      {/* End Custom Navbar/Header */}
      <div className="enquiries-table-container">
        <div className="enquiries-table-section">
          <div className="enquiries-table-header">
            <span className="enquiries-table-title">All Enquiries</span>
          </div>
          {error && <Alert variant="danger" className="my-3">{error}</Alert>}
          {loading ? (
            <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <Table className="enquiries-table" striped bordered hover responsive>
              <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                <tr>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Name</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Email</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Message</th>
                  <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">No enquiries found.</td></tr>
                ) : (
                  enquiries.map(enq => (
                    <tr key={enq.id}>
                      <td>{enq.name}</td>
                      <td>{enq.email}</td>
                      <td>{enq.message}</td>
                      <td className="enquiries-action-buttons">
                        <button
                          className="enquiries-icon-btn enquiries-delete-btn"
                          onClick={() => handleDelete(enq.id)}
                          title="Delete"
                          disabled={deleteLoading === enq.id}
                        >
                          {deleteLoading === enq.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H3h10h.5a.5.5 0 0 0 0-1h-11z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          className="enquiries-icon-btn enquiries-reply-btn ms-2"
                          onClick={() => handleOpenReply(enq)}
                          title="Reply"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.854 4.146a.5.5 0 0 0-.708.708L7.293 7H2.5A1.5 1.5 0 0 0 1 8.5v3A1.5 1.5 0 0 0 2.5 13h11A1.5 1.5 0 0 0 15 11.5v-3A1.5 1.5 0 0 0 13.5 7h-4.793l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L8.707 8H13.5A.5.5 0 0 1 14 8.5v3a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-3A.5.5 0 0 1 2.5 8H7.293l-1.147-1.146a.5.5 0 0 0-.708 0z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>
      {/* Reply Modal */}
      <Modal show={replyModal.show} onHide={handleCloseReply} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reply to {replyModal.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">To:</label>
            <input type="email" className="form-control" value={replyModal.email} disabled />
          </div>
          <div className="mb-3">
            <label className="form-label">Message:</label>
            <textarea
              className="form-control"
              rows="5"
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
            />
          </div>
          {replyError && <Alert variant="danger">{replyError}</Alert>}
          {replySuccess && <Alert variant="success">{replySuccess}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReply} disabled={replyLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendReply} disabled={replyLoading || !replyMessage}>
            {replyLoading ? 'Sending...' : 'Send Reply'}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Logout Modal */}
      <Modal show={showLogoutModal} onHide={handleCloseLogoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Would you like to log out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmLogout}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Enquiries;