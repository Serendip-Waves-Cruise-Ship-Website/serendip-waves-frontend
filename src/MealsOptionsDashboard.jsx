import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { FaUtensils, FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaLeaf, FaPlus } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import logo from './assets/logo.png';
import axios from 'axios';
import './MealsOptionsDashboard.css';

const MealsOptionsDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = (to) => { window.location.href = to; };
  
  // State management
  const [mealOptions, setMealOptions] = useState([]);
  const [mealPreferencesCount, setMealPreferencesCount] = useState(0);
  const [popularMealType, setPopularMealType] = useState('N/A');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedOption, setSelectedOption] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    key_features: '',
    image: '',
    status: 'active'
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Predefined meal types
  const mealTypes = [
    'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 
    'Diabetic-Friendly', 'Low-Sodium', 'Keto', 'Mediterranean', 'Asian'
  ];
  
  // Show alert
  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);
  
  // Fetch meal options
  const fetchMealOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/Project-I/backend/mealOptionsAPI.php');
      if (response.data.success) {
        setMealOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching meal options:', error);
      showAlert('Failed to fetch meal options', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Fetch meal preferences summary
  const fetchMealPreferencesSummary = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost/Project-I/backend/getAllMealPreferences.php');
      if (response.data.success && response.data.preferences) {
        const preferences = response.data.preferences;
        setMealPreferencesCount(preferences.length);
        
        // Find most popular meal type
        const mealTypeCounts = {};
        preferences.forEach(pref => {
          const mealType = pref.meal_type;
          mealTypeCounts[mealType] = (mealTypeCounts[mealType] || 0) + 1;
        });
        
        const mostPopular = Object.entries(mealTypeCounts).reduce((a, b) => 
          mealTypeCounts[a[0]] > mealTypeCounts[b[0]] ? a : b, ['N/A', 0]
        );
        
        setPopularMealType(mostPopular[0]);
      }
    } catch (error) {
      console.error('Error fetching meal preferences:', error);
      // Don't show error alert for this since it's optional data
    }
  }, []);
  
  useEffect(() => {
    fetchMealOptions();
    fetchMealPreferencesSummary();
  }, [fetchMealOptions, fetchMealPreferencesSummary]);
  
  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedImage(file);
    
    // Create preview for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Use FormData for image upload (like cruise ships)
      const data = new FormData();
      data.append('action', modalMode === 'add' ? 'create' : 'update');
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('key_features', formData.key_features);
      data.append('status', formData.status);
      
      if (modalMode === 'edit') {
        data.append('option_id', selectedOption.option_id);
        data.append('existing_image', formData.image || '');
      }
      
      // Add image file if selected
      if (selectedImage) {
        data.append('image', selectedImage);
      }
      
      const response = await axios.post('http://localhost/Project-I/backend/mealOptionsAPI.php', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        showAlert(response.data.message, 'success');
        closeModal();
        fetchMealOptions();
      } else {
        showAlert(response.data.message, 'danger');
      }
    } catch (error) {
      console.error('Error saving meal option:', error);
      showAlert('Failed to save meal option', 'danger');
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.type.trim()) errors.type = 'Type is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.key_features.trim()) errors.key_features = 'Key features are required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle modal operations
  const openModal = (mode, option = null) => {
    setModalMode(mode);
    setSelectedOption(option);
    
    if (mode === 'add') {
      setFormData({
        title: '',
        type: '',
        description: '',
        key_features: '',
        image: '',
        status: 'active'
      });
      setImagePreview(null);
      setSelectedImage(null);
    } else if (option) {
      setFormData({
        title: option.title,
        type: option.type,
        description: option.description,
        key_features: Array.isArray(option.key_features) ? option.key_features.join(', ') : option.key_features,
        image: option.image || '',
        status: option.status
      });
      // Set image preview for edit mode
      if (option.image) {
        setImagePreview(`http://localhost/Project-I/backend/meal_images/${option.image}`);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
    }
    
    setFormErrors({});
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedOption(null);
    setFormErrors({});
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  // Handle delete
  const handleDelete = async (optionId) => {
    if (!window.confirm('Are you sure you want to delete this meal option?')) return;
    
    try {
      const response = await axios.post('http://localhost/Project-I/backend/mealOptionsAPI.php', {
        action: 'delete',
        option_id: optionId
      });
      
      if (response.data.success) {
        showAlert(response.data.message, 'success');
        fetchMealOptions();
      } else {
        showAlert(response.data.message, 'danger');
      }
    } catch (error) {
      console.error('Error deleting meal option:', error);
      showAlert('Failed to delete meal option', 'danger');
    }
  };
  
  // Handle status toggle
  const handleStatusToggle = async (optionId) => {
    try {
      const response = await axios.post('http://localhost/Project-I/backend/mealOptionsAPI.php', {
        action: 'toggle_status',
        option_id: optionId
      });
      
      if (response.data.success) {
        showAlert(response.data.message, 'success');
        fetchMealOptions();
      } else {
        showAlert(response.data.message, 'danger');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showAlert('Failed to toggle status', 'danger');
    }
  };
  
  // Handle logout
  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    return (
      <Badge bg={status === 'active' ? 'success' : 'secondary'}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    );
  };
  
  return (
    <div className="meals-options-bg py-4">
      {/* Custom Navbar */}
      <div style={{
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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: '45px', width: 'auto', maxWidth: '60px', cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => navigate('/#top')}
          />
          <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#1a237e', letterSpacing: '0.5px' }}>
            Meal Options Management
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="superadmin-logout-btn"
        >
          Logout
        </button>
      </div>
      
      {/* Main Content */}
      <Container fluid style={{ marginTop: '80px' }}>
        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>
            {alert.message}
          </Alert>
        )}
        
        {/* Header Card */}
        <Card className="mb-4 shadow-lg">
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <h3 className="mb-0">
                  <FaUtensils className="me-2 text-primary" />
                  Meal Options Dashboard
                </h3>
                <p className="text-muted mb-0">Manage dining options for cruise passengers</p>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => openModal('add')}
                    className="d-flex align-items-center"
                  >
                    <FaPlus className="me-2" />
                    Add New Meal Option
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center h-100 shadow">
              <Card.Body>
                <h4 className="text-primary">{mealOptions.length}</h4>
                <p className="mb-0">Total Options</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100 shadow">
              <Card.Body>
                <h4 className="text-success">{mealOptions.filter(opt => opt.status === 'active').length}</h4>
                <p className="mb-0">Active Options</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100 shadow">
              <Card.Body>
                <h4 className="text-secondary">{mealOptions.filter(opt => opt.status === 'inactive').length}</h4>
                <p className="mb-0">Inactive Options</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100 shadow">
              <Card.Body>
                <h4 className="text-info">{new Set(mealOptions.map(opt => opt.type)).size}</h4>
                <p className="mb-0">Unique Types</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Meal Preferences Summary Card */}
        <Card className="mb-4 shadow-lg border-info">
          <Card.Header className="bg-info text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaUtensils className="me-2" />
                Customer Meal Preferences Summary
              </h5>
              <Button
                variant="light"
                size="sm"
                onClick={() => navigate('/meals-dashboard')}
                className="d-flex align-items-center"
              >
                View All Preferences →
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="text-center meal-preferences-summary">
              <Col md={4}>
                <div className="border-end">
                  <h3 className="text-info mb-1">{mealPreferencesCount}</h3>
                  <small className="text-muted">Total Meal Preferences</small>
                  <br />
                  <small className="text-muted">Received from customers</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="border-end">
                  <h3 className="text-success mb-1">{mealPreferencesCount}</h3>
                  <small className="text-muted">Active Bookings</small>
                  <br />
                  <small className="text-muted">With meal selections</small>
                </div>
              </Col>
              <Col md={4}>
                <div>
                  <h3 className="text-dark mb-1" style={{ fontSize: '1rem', lineHeight: '1.3', fontWeight: '600' }}>{popularMealType}</h3>
                  <small className="text-muted">Most Popular</small>
                  <br />
                  <small className="text-muted">Meal type requested</small>
                </div>
              </Col>
            </Row>
            <div className="mt-3 text-center">
              <small className="text-muted">
                💡 <strong>Tip:</strong> Click "View All Preferences" to see detailed meal preferences and inventory planning data.
              </small>
            </div>
          </Card.Body>
        </Card>
        
        {/* Main Table Card */}
        <Card className="shadow-lg">
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : mealOptions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No meal options found. Click "Add New Meal Option" to get started.
                      </td>
                    </tr>
                  ) : (
                    mealOptions.map((option, index) => (
                      <tr key={option.option_id}>
                        <td>{index + 1}</td>
                        <td>
                          {option.image ? (
                            <img
                              src={`http://localhost/Project-I/backend/meal_images/${option.image}`}
                              alt={option.title}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: '#f8f9fa',
                              display: option.image ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            <FaLeaf className="text-muted" />
                          </div>
                        </td>
                        <td>
                          <strong>{option.title}</strong>
                        </td>
                        <td>
                          <Badge bg="info">{option.type}</Badge>
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px' }}>
                            {option.description.length > 100
                              ? `${option.description.substring(0, 100)}...`
                              : option.description
                            }
                          </div>
                        </td>
                        <td>{getStatusBadge(option.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => openModal('view', option)}
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openModal('edit', option)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant={option.status === 'active' ? 'outline-warning' : 'outline-success'}
                              onClick={() => handleStatusToggle(option.option_id)}
                              title={option.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {option.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(option.option_id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
      
      {/* Add/Edit/View Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' && 'Add New Meal Option'}
            {modalMode === 'edit' && 'Edit Meal Option'}
            {modalMode === 'view' && 'Meal Option Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMode === 'view' ? (
            // View Mode
            selectedOption && (
              <div>
                <Row>
                  <Col md={4}>
                    {selectedOption.image ? (
                      <img
                        src={`http://localhost/Project-I/backend/meal_images/${selectedOption.image}`}
                        alt={selectedOption.title}
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light rounded"
                        style={{ height: '200px' }}
                      >
                        <FaLeaf size={50} className="text-muted" />
                      </div>
                    )}
                  </Col>
                  <Col md={8}>
                    <h4>{selectedOption.title}</h4>
                    <Badge bg="info" className="mb-2">{selectedOption.type}</Badge>
                    <p>{selectedOption.description}</p>
                    <div>
                      <strong>Key Features:</strong>
                      <ul className="mt-2">
                        {Array.isArray(selectedOption.key_features) 
                          ? selectedOption.key_features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))
                          : <li>{selectedOption.key_features}</li>
                        }
                      </ul>
                    </div>
                    <div className="mt-3">
                      <strong>Status:</strong> {getStatusBadge(selectedOption.status)}
                    </div>
                  </Col>
                </Row>
              </div>
            )
          ) : (
            // Add/Edit Mode
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.title}
                      placeholder="Enter meal option title"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.title}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.type}
                    >
                      <option value="">Select meal type</option>
                      {mealTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.type}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.description}
                  placeholder="Enter meal option description"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.description}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Key Features <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="key_features"
                  value={formData.key_features}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.key_features}
                  placeholder="Enter key features separated by commas"
                />
                <Form.Text className="text-muted">
                  Separate multiple features with commas (e.g., "Gluten-free, Low sodium, High protein")
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formErrors.key_features}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Image Upload</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Select an image file (JPEG, PNG, GIF, WebP) - Max 5MB
                    </Form.Text>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-3">
                        <p className="mb-2"><strong>Image Preview:</strong></p>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Current image filename for edit mode */}
                    {modalMode === 'edit' && formData.image && !imagePreview && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Current image: {formData.image}
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {modalMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {modalMode !== 'view' && (
            <Button variant="primary" onClick={handleSubmit}>
              {modalMode === 'add' ? 'Add Meal Option' : 'Update Meal Option'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={handleCloseLogoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MealsOptionsDashboard;