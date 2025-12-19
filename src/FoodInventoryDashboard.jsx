import React, { useState, useMemo, useContext, useEffect } from 'react';
import axios from 'axios';
import './foodInventory.css';
import { Button, Table, Badge, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaFileCsv, FaFilePdf, FaHistory, FaBoxOpen, FaExclamationTriangle, FaTimesCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { useToast } from './hooks/useToast';
import logo from './assets/logo.png';

// Status constants
const STATUS = {
  IN_STOCK: 'In Stock',
  LOW: 'Low Stock',
  EXPIRED: 'Expired'
};

// Function to get status badge with color
const getStatusBadge = (status) => {
  let variant = 'secondary';
  let text = status;
  let icon = null;
  
  switch (status) {
    case STATUS.IN_STOCK:
      variant = 'success';
      icon = <FaBoxOpen className="me-1" />;
      break;
    case STATUS.LOW:
      variant = 'warning';
      icon = <FaExclamationTriangle className="me-1" />;
      break;
    case STATUS.EXPIRED:
      variant = 'danger';
      icon = <FaTimesCircle className="me-1" />;
      break;
    default:
      variant = 'secondary';
  }
  
  return (
    <Badge bg={variant} className="status-badge">
      {icon}{text}
    </Badge>
  );
};

const LOW_THRESHOLD = 20; // Example threshold for low stock

function getStatus(item) {
  const today = new Date();
  const expiry = new Date(item.expiryDate);
  if (expiry < today) return STATUS.EXPIRED;
  if (item.quantity < LOW_THRESHOLD) return STATUS.LOW;
  return STATUS.IN_STOCK;
}

const unitOptions = ['kg', 'l', 'packs'];
const mealTypes = ['Grains', 'Meat', 'Dairy', 'Fruits', 'Vegetables', 'Beverages', 'Others'];

function FoodInventoryDashboard({ userRole = 'Super Admin' }) {
  const { logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useToast();
  const navigate = (to) => { window.location.href = to; };
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  const [form, setForm] = useState({
    id: '',
    itemName: '',
    category: '',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
    supplier: '',
    supplierContacts: '',
    supplierEmail: '',
    unitPrice: '',
    purchaseDate: '',
  });
  const [formError, setFormError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [itemStatusFilter, setItemStatusFilter] = useState('All');

  // Fetch data from backend
  useEffect(() => {
    // Fetch inventory data including inactive items for toggle functionality
    axios.get('http://localhost/Project-I/backend/getInventory.php?include_inactive=true')
      .then(res => {
        const mapped = res.data.map(item => ({
          id: item.item_id,
          itemName: item.food_item_name,
          category: item.category,
          quantity: item.quantity_in_stock,
          unit: item.unit || 'kg', // Use item.unit if available, else default
          expiryDate: item.expiry_date,
          supplier: item.supplier_name,
          supplierContacts: item.supplier_contact,
          supplierEmail: item.supplier_email,
          unitPrice: item.unit_price,
          purchaseDate: item.purchase_date || '',
          status: item.status, // Stock status (In Stock, Low Stock, Expired)
          item_status: item.item_status || 'active', // Active/Inactive status
        }));
        setData(mapped);
      })
      .catch(() => setData([]));


  }, []);

  // Unique suppliers for filter dropdown
  const suppliers = useMemo(() => ['All', ...Array.from(new Set(data.map(i => i.supplier)))], [data]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const status = getStatus(item);
      if (statusFilter !== 'All' && status !== statusFilter) return false;
      if (supplierFilter !== 'All' && item.supplier !== supplierFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (itemStatusFilter !== 'All' && item.item_status !== itemStatusFilter) return false;
      return true;
    }).sort((a, b) => {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  }, [data, statusFilter, supplierFilter, categoryFilter, itemStatusFilter]);

  // Role-based access
  if (userRole !== 'Super Admin' && userRole !== 'Pantry Admin') {
    return <div className="alert alert-danger mt-5 text-center">Access Denied</div>;
  }

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setForm(item ? { ...item, supplierEmail: item.supplierEmail || '' } : {
      id: '',
      itemName: '',
      category: '',
      quantity: '',
      unit: 'kg',
      expiryDate: '',
      supplier: '',
      supplierContacts: '',
      supplierEmail: '',
      unitPrice: '',
      purchaseDate: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // After add/edit, refresh and map data
  const refreshData = () => {
    axios.get('http://localhost/Project-I/backend/getInventory.php?include_inactive=true')
      .then(res => {
        const mapped = res.data.map(item => ({
          id: item.item_id,
          itemName: item.food_item_name,
          category: item.category,
          quantity: item.quantity_in_stock,
          unit: item.unit || 'kg',
          expiryDate: item.expiry_date,
          supplier: item.supplier_name,
          supplierContacts: item.supplier_contact,
          supplierEmail: item.supplier_email,
          unitPrice: item.unit_price,
          purchaseDate: item.purchase_date || '',
          status: item.status, // Stock status (In Stock, Low Stock, Expired)
          item_status: item.item_status || 'active', // Active/Inactive status
        }));
        setData(mapped);
      })
      .catch(() => setData([]));
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!form.itemName || !form.quantity || !form.unit || !form.expiryDate || !form.supplier) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    try {
      const payload = {
        food_item_name: form.itemName,
        category: form.category,
        quantity_in_stock: Number(form.quantity),
        unit: form.unit, // Add the unit field
        unit_price: Number(form.unitPrice),
        expiry_date: form.expiryDate,
        purchase_date: form.purchaseDate,
        supplier_name: form.supplier,
        supplier_contact: form.supplierContacts,
        supplier_email: form.supplierEmail,
        status: getStatus({ ...form, quantity: Number(form.quantity), expiryDate: form.expiryDate })
      };
      
      if (modalMode === 'add') {
        await axios.post('http://localhost/Project-I/backend/addFoodItem.php', payload);
      } else if (modalMode === 'edit') {
        await axios.post('http://localhost/Project-I/backend/updateStock.php', {
          ...payload,
          item_id: form.id
        });
      }
      
      refreshData();
      setShowModal(false);
      setFormError('');
      showSuccess(modalMode === 'add' ? 'Food item added successfully!' : 'Food item updated successfully!');
    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Error saving item. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        errorMessage = `Server error (${error.response.status}): ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      setFormError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDelete = async id => {
    const item = data.find(item => item.id === id);
    // Check item_status instead of status (status is for stock level, item_status is for active/inactive)
    const isActive = item.item_status !== 'inactive';
    const confirmMessage = isActive 
      ? 'Are you sure you want to deactivate this item?' 
      : 'Are you sure you want to reactivate this item?';
    
    showConfirm(confirmMessage, async () => {
      try {
        await axios.post('http://localhost/Project-I/backend/updateStock.php', {
          action: isActive ? 'delete' : 'activate',
          item_id: id
        });
        refreshData();
        showSuccess(isActive ? 'Item deactivated successfully!' : 'Item reactivated successfully!');
      } catch (error) {
        console.error('Error updating item status:', error);
        showError('Error updating item status. Please try again.');
      }
    });
  };

  // Summary counts
  const totalItems = data.length;
  const lowStockCount = data.filter(item => getStatus(item) === STATUS.LOW).length;
  const expiredCount = data.filter(item => getStatus(item) === STATUS.EXPIRED).length;

  const _handleShowDetails = (item) => {
    setDetailsItem(item);
    setShowDetails(true);
  };
  const handleCloseDetails = () => setShowDetails(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };
  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };
  const handleConfirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  return (
    <div className="food-inventory-bg py-4">
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
            Pantry & Supply Management
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="superadmin-logout-btn"
        >
          Logout
        </button>
      </div>
      {/* End Custom Navbar */}
      <div className="container food-inventory-dashboard" style={{ marginTop: '80px' }}>
        {/* Summary Bar */}
        <div className="summary-bar d-flex flex-wrap justify-content-center gap-3 mb-4">
          <div className="summary-card">
            <FaBoxOpen className="summary-icon text-primary" />
            <div className="summary-label">Total Items</div>
            <div className="summary-value">{totalItems}</div>
          </div>
          <div className="summary-card">
            <FaExclamationTriangle className="summary-icon text-warning" />
            <div className="summary-label">Low Stock</div>
            <div className="summary-value text-warning">{lowStockCount}</div>
          </div>
          <div className="summary-card">
            <FaTimesCircle className="summary-icon text-danger" />
            <div className="summary-label">Expired</div>
            <div className="summary-value text-danger">{expiredCount}</div>
          </div>
        </div>
        {/* Filters & Table Card */}
        <div className="card p-4 mb-4 shadow-lg rounded-4">
          {/* Filters */}
          <div className="mb-3">
            <Row className="g-3 align-items-end">
              <Col md={2}>
                <Form.Label>Stock Status</Form.Label>
                <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value={STATUS.IN_STOCK}>In Stock</option>
                  <option value={STATUS.LOW}>Low</option>
                  <option value={STATUS.EXPIRED}>Expired</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label>Item Status</Form.Label>
                <Form.Select value={itemStatusFilter} onChange={e => setItemStatusFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label>Supplier</Form.Label>
                <Form.Select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
                  {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label>Meal Type</Form.Label>
                <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="All">All</option>
                  {mealTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
              </Col>
              <Col md={2} className="d-flex align-items-end justify-content-end">
                <Button variant="primary" onClick={() => handleShowModal('add')}><FaPlus className="me-2" />Add New Item</Button>
              </Col>
            </Row>
          </div>
          {/* Inventory Table */}
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              <Table className="align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                <thead style={{ background: '#6c5ce7', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Meal Title</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Type</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Unit Price</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Total Price</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Expiry Date</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Supplier</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Contact</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Email</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Stock Status</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 10px', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center text-muted" style={{ padding: '40px' }}>
                        <div style={{ fontSize: '1.1rem' }}>No meal items found</div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => {
                      const status = getStatus(item);
                      const totalPrice = Number(item.quantity) * Number(item.unitPrice || 0);
                      return (
                        <tr key={item.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e9ecef', opacity: item.item_status === 'inactive' ? 0.6 : 1 }}>
                          <td style={{ padding: '14px 12px', fontWeight: '500' }}>{item.itemName}</td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ background: '#e7f0ff', color: '#667eea', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '500' }}>{item.quantity} {item.unit}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'right', color: '#666' }}>{item.unitPrice ? `$ ${item.unitPrice}` : '-'}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', color: '#1e7e34' }}>{item.unitPrice ? `$ ${totalPrice.toLocaleString()}` : '-'}</td>
                          <td style={{ padding: '14px 12px' }}>{item.expiryDate}</td>
                          <td style={{ padding: '14px 12px' }}>{item.supplier}</td>
                          <td style={{ padding: '14px 12px', color: '#666' }}>{item.supplierContacts || '-'}</td>
                          <td style={{ padding: '14px 12px', color: '#666' }}>{item.supplierEmail || '-'}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>{getStatusBadge(status)}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <Badge bg={item.item_status === 'active' ? 'success' : 'secondary'}>
                              {item.item_status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => handleShowModal('edit', item)}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              >
                                <FaEdit />
                              </button>
                              <button
                                style={{ background: item.item_status === 'active' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => handleDelete(item.id)}
                                title={item.item_status === 'active' ? 'Deactivate Item' : 'Activate Item'}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              >
                                {item.item_status === 'active' ? <FaToggleOff /> : <FaToggleOn />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
            </Table>
            </div>
          </div>
        </div>
        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{modalMode === 'add' ? 'Add New Meal Item' : 'Edit Meal Item'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFormSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Raw Material *</Form.Label>
                    <Form.Control 
                      name="itemName" 
                      type="text" 
                      value={form.itemName} 
                      onChange={handleFormChange} 
                      placeholder="Enter raw material name"
                      isInvalid={!form.itemName && formError}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Quantity *</Form.Label>
                    <InputGroup>
                      <Form.Control name="quantity" type="number" value={form.quantity} onChange={handleFormChange} isInvalid={!form.quantity && formError} />
                      <Form.Select name="unit" value={form.unit} onChange={handleFormChange} style={{ maxWidth: 100 }}>
                        {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Expiry Date *</Form.Label>
                    <Form.Control name="expiryDate" type="date" value={form.expiryDate} onChange={handleFormChange} isInvalid={!form.expiryDate && formError} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Supplier *</Form.Label>
                    <Form.Control name="supplier" value={form.supplier} onChange={handleFormChange} isInvalid={!form.supplier && formError} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Supplier Contacts</Form.Label>
                    <Form.Control name="supplierContacts" value={form.supplierContacts} onChange={handleFormChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Supplier Email</Form.Label>
                    <Form.Control name="supplierEmail" type="email" value={form.supplierEmail} onChange={handleFormChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Unit Price ($)</Form.Label>
                    <Form.Control name="unitPrice" type="number" min="0" value={form.unitPrice} onChange={handleFormChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Purchase Date</Form.Label>
                    <Form.Control name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleFormChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Type *</Form.Label>
                    <Form.Select name="category" value={form.category} onChange={handleFormChange} isInvalid={!form.category && formError}>
                      <option value="">Select Type</option>
                      {mealTypes.map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {formError && <div className="text-danger mt-2">{formError}</div>}
              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">Cancel</Button>
                <Button variant="primary" type="submit">{modalMode === 'add' ? 'Add Item' : 'Save Changes'}</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        {/* Details Modal */}
        <Modal show={showDetails} onHide={handleCloseDetails} centered>
          <Modal.Header closeButton>
            <Modal.Title>Meal Item Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {detailsItem && (
              <div>
                <p><strong>Meal Title:</strong> {detailsItem.itemName}</p>
                <p><strong>Type:</strong> {detailsItem.category}</p>
                <p><strong>Quantity:</strong> {detailsItem.quantity} {detailsItem.unit}</p>
                <p><strong>Unit Price:</strong> {detailsItem.unitPrice ? `$ ${detailsItem.unitPrice}` : '-'}</p>
                <p><strong>Total Price:</strong> {detailsItem.unitPrice ? `$ ${Number(detailsItem.quantity) * Number(detailsItem.unitPrice || 0)}` : '-'}</p>
                <p><strong>Expiry Date:</strong> {detailsItem.expiryDate}</p>
                <p><strong>Supplier:</strong> {detailsItem.supplier}</p>
                <p><strong>Supplier Contacts:</strong> {detailsItem.supplierContacts || '-'}</p>
                <p><strong>Supplier Email:</strong> {detailsItem.supplierEmail || '-'}</p>
                <p><strong>Purchase Date:</strong> {detailsItem.purchaseDate || '-'}</p>
                <p><strong>Stock Status:</strong> {getStatusBadge(getStatus(detailsItem))}</p>
                <p><strong>Item Status:</strong> 
                  <Badge bg={detailsItem.item_status === 'active' ? 'success' : 'secondary'} className="ms-2">
                    {detailsItem.item_status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </p>
              </div>
            )}
          </Modal.Body>
        </Modal>
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
}

export default FoodInventoryDashboard;

 