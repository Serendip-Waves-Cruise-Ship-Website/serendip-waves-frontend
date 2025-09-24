import React, { useEffect, useState, useContext, useCallback } from 'react';
import './ItineraryDetails.css';
import logo from './assets/logo.png';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { useToast } from './hooks/useToast';

const API_BASE = 'http://localhost/Project-I/backend';

const initialForm = {
  description: '',
  schedule: '',
  image1: null,
  image2: null,
  image3: null,
  image4: null,
  image5: null,
  destination: '',
};

const ItineraryDetails = () => {
  const { logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useToast();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [itineraries, setItineraries] = useState([]); // Store all itineraries
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  // Custom Navbar (Admin Dashboard style)
  const navbar = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        minHeight: '60px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #eee'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: '45px', width: 'auto', maxWidth: '60px', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/#top')}
        />
        <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#1a237e', letterSpacing: '0.5px' }}>
          Itinerary Details
        </div>
      </div>
      <button
        onClick={handleLogoutClick}
        className="superadmin-logout-btn"
      >
        Logout
      </button>
    </div>
  );

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/getItineraryDetails.php`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDetails(data);
    } catch (error) {
      console.error('Error fetching details:', error);
      showError('Error fetching itinerary details');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Fetch available destinations (arrival countries) from itineraries
  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${API_BASE}/getItineraries.php`);
      if (!res.ok) throw new Error('Failed to fetch itineraries');
      const data = await res.json();
      setItineraries(data); // Store all itineraries
      const uniqueDest = [...new Set(data.map(item => item.route).filter(Boolean))];
      setDestinations(uniqueDest);
    } catch {
      setDestinations([]);
      setItineraries([]);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchDestinations();
  }, [fetchDetails]);

  const handleInputChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Find itinerary_id for selected destination
    const itinerary = itineraries.find(it => it.route === form.destination);
    if (!itinerary) {
      showError('Selected destination does not match any itinerary.');
      return;
    }
    const endpoint = editId ? 'updateItineraryDetail.php' : 'addItineraryDetail.php';
    const formData = new FormData();
    formData.append('itinerary_id', itinerary.id); // Always set itinerary_id
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'itinerary_id' && value !== null && value !== '') formData.append(key, value);
    });
    if (editId) formData.append('detail_id', editId);
    setEditLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(editId ? 'Itinerary detail updated successfully!' : 'Itinerary detail added successfully!');
        setForm(initialForm);
        setEditId(null);
        setShowModal(false);
        fetchDetails();
      } else {
        showError(data.message || 'Error saving detail');
      }
    } catch (error) {
      console.error('Error saving detail:', error);
      showError('Error saving detail');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEdit = detail => {
    setEditId(detail.detail_id);
    setForm({
      itinerary_id: detail.itinerary_id,
      description: detail.description,
      schedule: detail.schedule,
      image1: null,
      image2: null,
      image3: null,
      image4: null,
      image5: null,
      destination: detail.destination, // Set destination from detail
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    showConfirm('Delete this itinerary detail?', async () => {
      try {
        const res = await fetch(`${API_BASE}/deleteItineraryDetail.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ detail_id: id }),
        });
        const data = await res.json();
        if (res.ok) {
          showSuccess('Itinerary detail deleted successfully!');
          fetchDetails();
        } else {
          showError(data.message || 'Error deleting detail');
        }
      } catch (error) {
        console.error('Error deleting detail:', error);
        showError('Error deleting detail');
      }
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialForm);
    setShowModal(false);
  };

  const handleAddDetail = () => {
    setEditId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  return (
    <div className="itinerary-dashboard-bg">
      {navbar}
      <div style={{ marginTop: '80px', width: '100%' }}>
        <div className="itinerary-container">
          <div className="table-section">
            <div className="table-header">
              <div className="table-title">Itinerary Details</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={fetchDetails} className="add-btn" type="button">Refresh</button>
                <button className="add-btn" type="button" onClick={handleAddDetail}>Add Detail</button>
              </div>
            </div>
            {loading && <div style={{ padding: 18 }}>Loading...</div>}
            <div className="itinerary-details-table-container">
              <table className="itinerary-details-table itinerary-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Image 1</th>
                    <th>Image 2</th>
                    <th>Image 3</th>
                    <th>Image 4</th>
                    <th>Image 5</th>
                    <th>Schedule</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {details.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>No details found.</td></tr>
                  ) : (
                    details.map((detail, idx) => (
                      <tr key={idx}>
                        <td>
                          <span
                            style={{ color: '#1e3a8a', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => navigate(`/destination/${encodeURIComponent(detail.destination.toLowerCase())}`, { state: { destination: detail } })}
                          >
                            {detail.destination}
                          </span>
                        </td>
                        {[1,2,3,4,5].map(i => (
                          <td key={i}>
                            {detail[`image${i}`] ? (
                              <img src={`http://localhost/Project-I/backend/${detail[`image${i}`]}`} alt={`img${i}`} />
                            ) : '-' }
                          </td>
                        ))}
                        <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{detail.schedule}</td>
                        <td>
                          <div className="horizontal-action-buttons">
                            <button
                              className="action-rect-btn edit"
                              title="Edit"
                              onClick={() => handleEdit(detail)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-rect-btn delete"
                              title="Delete"
                              onClick={() => handleDelete(detail.detail_id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Modal show={showModal} onHide={handleCancelEdit} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>{editId ? 'Edit' : 'Add'} Itinerary Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="form-group">
                      <Form.Label>Destination*</Form.Label>
                      <Form.Select name="destination" value={form.destination} onChange={handleInputChange} required>
                        <option value="">Select destination</option>
                        {destinations.map(dest => (
                          <option key={dest} value={dest}>{dest}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="form-group">
                      <Form.Label>Description*</Form.Label>
                      <Form.Control as="textarea" name="description" value={form.description} onChange={handleInputChange} required rows={2} />
                    </Form.Group>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <Form.Group className="form-group">
                      <Form.Label>Schedule</Form.Label>
                      <Form.Control as="textarea" name="schedule" value={form.schedule} onChange={handleInputChange} rows={2} />
                    </Form.Group>
                  </div>
                </div>
                <div className="row">
                  {[1,2,3,4,5].map(i => (
                    <div className="col-md-4" key={i} style={{ marginBottom: 12 }}>
                      <Form.Group className="form-group">
                        <Form.Label>Image {i}</Form.Label>
                        <Form.Control type="file" name={`image${i}`} accept="image/*" onChange={handleInputChange} />
                      </Form.Group>
                    </div>
                  ))}
                </div>

              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={editLoading}>
                {editId ? 'Update Detail' : 'Add Detail'}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
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

export default ItineraryDetails; 