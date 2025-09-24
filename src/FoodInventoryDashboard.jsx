import React, { useState, useMemo, useContext, useEffect } from 'react';
import axios from 'axios';
import './foodInventory.css';
import { Button, Table, Badge, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaFileCsv, FaFilePdf, FaHistory, FaBoxOpen, FaExclamationTriangle, FaTimesCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
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
const mealTypes = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'Continental', 'Asian', 'Local'];

function FoodInventoryDashboard({ userRole = 'Super Admin' }) {
  const { logout } = useContext(AuthContext);
  const navigate = (to) => { window.location.href = to; };
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [mealTitles, setMealTitles] = useState([]);
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

    // Fetch meal options and types
    axios.get('http://localhost/Project-I/backend/mealOptionsAPI.php')
      .then(res => {
        if (res.data.success && res.data.data) {
          // Extract unique titles and types
          const titles = [...new Set(res.data.data.map(option => option.title))];
          setMealTitles(titles);
        }
      })
      .catch(err => {
        console.error('Error fetching meal options:', err);
      });
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
  };

  const handleDelete = async id => {
    const item = data.find(item => item.id === id);
    // Check item_status instead of status (status is for stock level, item_status is for active/inactive)
    const isActive = item.item_status !== 'inactive';
    const confirmMessage = isActive 
      ? 'Are you sure you want to deactivate this item?' 
      : 'Are you sure you want to reactivate this item?';
    
    if (window.confirm(confirmMessage)) {
      try {
        await axios.post('http://localhost/Project-I/backend/updateStock.php', {
          action: isActive ? 'delete' : 'activate',
          item_id: id
        });
        refreshData();
      } catch (error) {
        console.error('Error updating item status:', error);
        alert('Error updating item status. Please try again.');
      }
    }
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
          <div className="table-responsive">
            <Table striped bordered hover className="align-middle food-table luxury-table">
              <thead className="table-primary sticky-top luxury-thead">
                <tr>
                  <th>Meal Title</th>
                  <th>Type</th>
                  <th>Quantity in Stock</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Expiry Date</th>
                  <th>Supplier Name</th>
                  <th>Supplier Contacts</th>
                  <th>Supplier Email</th>
                  <th>Stock Status</th>
                  <th>Item Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr><td colSpan={12} className="text-center">No meal items found.</td></tr>
                ) : (
                  filteredData.map(item => {
                    const status = getStatus(item);
                    const totalPrice = Number(item.quantity) * Number(item.unitPrice || 0);
                    return (
                      <tr key={item.id} className={item.item_status === 'inactive' ? 'table-secondary' : ''}>
                        <td>{item.itemName}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{item.unitPrice ? `Rs. ${item.unitPrice}` : '-'}</td>
                        <td>{item.unitPrice ? `Rs. ${totalPrice}` : '-'}</td>
                        <td>{item.expiryDate}</td>
                        <td>{item.supplier}</td>
                        <td>{item.supplierContacts || '-'}</td>
                        <td>{item.supplierEmail || '-'}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          <Badge bg={item.item_status === 'active' ? 'success' : 'secondary'}>
                            {item.item_status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleShowModal('edit', item)}>
                            <FaEdit />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={item.item_status === 'active' ? 'outline-warning' : 'outline-success'} 
                            onClick={() => handleDelete(item.id)}
                            title={item.item_status === 'active' ? 'Deactivate Item' : 'Activate Item'}
                          >
                            {item.item_status === 'active' ? <FaToggleOff /> : <FaToggleOn />}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
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
                    <Form.Label>Title of the Meal *</Form.Label>
                    <Form.Select name="itemName" value={form.itemName} onChange={handleFormChange} isInvalid={!form.itemName && formError}>
                      <option value="">Select Meal Title</option>
                      {mealTitles.map(title => <option key={title} value={title}>{title}</option>)}
                    </Form.Select>
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
                    <Form.Label>Unit Price (Rs.)</Form.Label>
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
                <p><strong>Unit Price:</strong> {detailsItem.unitPrice ? `Rs. ${detailsItem.unitPrice}` : '-'}</p>
                <p><strong>Total Price:</strong> {detailsItem.unitPrice ? `Rs. ${Number(detailsItem.quantity) * Number(detailsItem.unitPrice || 0)}` : '-'}</p>
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
          Do you want to logout?
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