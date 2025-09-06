import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUser,
  FaSearch,
  FaTimes,
  FaEdit,
  FaTrash,
  FaBed,
  FaHashtag,
  FaShip,
  FaDoorOpen,
  FaCheckCircle,
  FaPlus,
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
} from "react-icons/fa";
import logo from './assets/logo.png';
import { AuthContext } from './AuthContext';
import { Modal, Button } from 'react-bootstrap';

const cabinTypes = ["Interior", "Ocean View", "Balcony", "Suite"];
const statusOptions = ["Available", "Booked", "Maintenance"];
const filterStatusOptions = ["Available", "Booked", "Occupied", "Maintenance"];

function CabinAdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = (to) => { window.location.href = to; };
  const [cabins, setCabins] = useState([]);
  const [cruiseNames, setCruiseNames] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cruise, setCruise] = useState("All Cruises");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Status");
  const [editIdx, setEditIdx] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  // Fetch cabins from backend
  const fetchCabins = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost/Project-I/backend/getCabins.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCabins(
            data.cabins.map((c) => ({
              id: c.cabin_id,
              passenger: c.passenger_name,
              cruise: c.cruise_name,
              type: c.cabin_type,
              number: c.cabin_number,
              guests: c.guests_count,
              date: c.booking_date,
              price: parseFloat(c.total_cost),
              status: c.status || "Booked",
              tripStart: c.start_date,
              tripEnd: c.end_date,
            }))
          );
        } else {
          setError(data.message || "Failed to fetch cabins");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching cabins");
        setLoading(false);
      });
  };

  // Fetch cruise names from backend
  const fetchCruiseNames = () => {
    console.log('Fetching cruise names from backend...');
    fetch("http://localhost/Project-I/backend/getShipDetails.php")
      .then((res) => res.json())
      .then((data) => {
        console.log('Raw ship data from API:', data);
        if (Array.isArray(data)) {
          // Extract unique ship names from the response
          const uniqueShipNames = [...new Set(data.map(ship => ship.ship_name))];
          console.log('Extracted ship names:', uniqueShipNames);
          setCruiseNames(uniqueShipNames);
        } else {
          console.error('API response is not an array:', data);
        }
      })
      .catch((error) => {
        console.error("Error fetching cruise names:", error);
        // Fallback to empty array if fetch fails
        setCruiseNames([]);
      });
  };

  useEffect(() => {
    fetchCabins();
    fetchCruiseNames();
  }, []);

  // Debug effect to log cruise names when they change
  useEffect(() => {
    console.log('Cruise names state updated:', cruiseNames);
  }, [cruiseNames]);

  const handleClear = () => {
    setSearch("");
    setCruise("All Cruises");
    setType("All Types");
    setStatus("All Status");
  };

  const filteredCabins = cabins.filter((cabin) => {
    const matchesSearch =
      search === "" ||
      [cabin.passenger, cabin.contact, cabin.id, cabin.cruise, cabin.number]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesCruise = cruise === "All Cruises" || cabin.cruise === cruise;
    const matchesType = type === "All Types" || cabin.type === type;
    
    // Enhanced status matching to handle dynamic status
    let matchesStatus = status === "All Status";
    if (!matchesStatus) {
      if (status === "Maintenance" && cabin.status === "Maintenance") {
        matchesStatus = true;
      } else if (status !== "Maintenance") {
        // For non-maintenance status, check both static and dynamic status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentStatus = cabin.status || "Available";
        
        if (cabin.tripStart && cabin.tripEnd && cabin.status !== "Maintenance") {
          const start = new Date(cabin.tripStart);
          const end = new Date(cabin.tripEnd);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          
          if (today < start) {
            currentStatus = "Booked";
          } else if (today >= start && today <= end) {
            currentStatus = "Occupied";
          } else if (today > end) {
            currentStatus = "Available";
          }
        }
        
        matchesStatus = currentStatus === status;
      }
    }
    
    return matchesSearch && matchesCruise && matchesType && matchesStatus;
  });

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditStatus(filteredCabins[idx].status);
  };
  const handleDelete = async (idx) => {
    const cabin = filteredCabins[idx];
    const cabinId = cabin.id;
    
    if (!window.confirm(`Are you sure you want to delete cabin ${cabin.number} for ${cabin.passenger}?`)) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost/Project-I/backend/cabinManagement.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cabin_id: cabinId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from local state only after successful backend deletion
        setCabins(cabins.filter((c) => c.id !== cabinId));
        alert('Cabin deleted successfully!');
      } else {
        alert('Failed to delete cabin: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting cabin:', error);
      alert('Error deleting cabin. Please try again.');
    }
  };
  const handleSave = async () => {
    const cabin = filteredCabins[editIdx];
    const cabinId = cabin.id;
    
    try {
      const response = await fetch('http://localhost/Project-I/backend/cabinManagement.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cabin_id: cabinId,
          status: editStatus
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state only after successful backend update
        setCabins(
          cabins.map((c) => (c.id === cabinId ? { ...c, status: editStatus } : c))
        );
        setEditIdx(null);
        alert('Cabin status updated successfully!');
      } else {
        alert('Failed to update cabin: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating cabin:', error);
      alert('Error updating cabin. Please try again.');
    }
  };

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
        padding: '2px 2px',
        background: '#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        minHeight: '90px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #eee'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: '80px', width: 'auto', maxWidth: '100px', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => navigate('/#top')}
        />
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#1a237e', letterSpacing: '1px' }}>
          Cabin Management
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 1rem',
      }}
    >
      {navbar}
      <div style={{ marginTop: '110px', width: '100%' }}>
        {/* Filter Card */}
        <div className="cabin-card mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">
                <FaSearch className="me-2 text-primary" />
                Search
              </label>
              <input
                type="text"
                className="form-control search-input border-primary rounded-pill"
                placeholder="Passenger Name, Cabin No, Cruise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">
                <FaShip className="me-2 text-primary" />
                Cruise Name
              </label>
              <select
                className="form-select rounded-pill border-primary"
                value={cruise}
                onChange={(e) => setCruise(e.target.value)}
              >
                <option>All Cruises</option>
                {cruiseNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label fw-semibold">
                <FaDoorOpen className="me-2 text-primary" />
                Cabin Type
              </label>
              <select
                className="form-select rounded-pill border-primary"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>All Types</option>
                {cabinTypes.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label fw-semibold">
                <FaCheckCircle className="me-2 text-primary" />
                Status
              </label>
              <select
                className="form-select rounded-pill border-primary"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All Status</option>
                {filterStatusOptions.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end gap-2">
              <button
                className="btn btn-secondary rounded-pill px-3 d-flex align-items-center gap-2 w-100"
                onClick={handleClear}
              >
                <FaTimes />
                Clear
              </button>
              <button
                className="btn btn-primary rounded-pill px-4 py-2 d-flex flex-column align-items-center justify-content-center w-100"
                style={{ fontSize: "1rem", lineHeight: 1.1 }}
              >
                <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>
                  <FaPlus />
                </span>
                <span style={{ fontWeight: 600 }}>Add</span>
                <span style={{ fontWeight: 600 }}>Cabin</span>
              </button>
            </div>
          </div>
        </div>
        <div className="cabin-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>
                    <FaHashtag className="me-2 text-primary" />
                    Cabin ID
                  </th>
                  <th>
                    <FaUser className="me-2 text-primary" />
                    Passenger Name
                  </th>
                  <th>
                    <FaShip className="me-2 text-primary" />
                    Cruise Name
                  </th>
                  <th>
                    <FaBed className="me-2 text-primary" />
                    Cabin Type
                  </th>
                  <th>
                    <FaDoorOpen className="me-2 text-primary" />
                    Cabin No
                  </th>
                  <th>
                    <FaUsers className="me-2 text-primary" />
                    Guests
                  </th>
                  <th>
                    <FaCalendarAlt className="me-2 text-primary" />
                    Booking Date
                  </th>
                  <th>
                    <FaDollarSign className="me-2 text-primary" />
                    Total Price
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCabins.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-muted">
                      No cabins found.
                    </td>
                  </tr>
                ) : (
                  filteredCabins.map((cabin, idx) => (
                    <tr key={cabin.id}>
                      <td>{cabin.id}</td>
                      <td>{cabin.passenger}</td>
                      <td>{cabin.cruise}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-75 rounded-pill">
                          {cabin.type}
                        </span>
                      </td>
                      <td>{cabin.number}</td>
                      <td>{cabin.guests}</td>
                      <td>{cabin.date}</td>
                      <td>${cabin.price.toLocaleString()}</td>
                      <td>
                        {(() => {
                          // Get current date (without time for accurate date comparison)
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          let statusLabel = cabin.status || "Available";
                          let badgeClass = "bg-secondary";
                          
                          // If admin has manually set status to Maintenance, always show that
                          if (cabin.status === "Maintenance") {
                            return (
                              <span className="badge rounded-pill bg-warning text-dark">
                                Maintenance
                              </span>
                            );
                          }
                          
                          // Check trip dates for dynamic status
                          if (cabin.tripStart && cabin.tripEnd) {
                            const start = new Date(cabin.tripStart);
                            const end = new Date(cabin.tripEnd);
                            start.setHours(0, 0, 0, 0);
                            end.setHours(23, 59, 59, 999);
                            
                            if (today < start) {
                              statusLabel = "Booked";
                              badgeClass = "bg-primary";
                            } else if (today >= start && today <= end) {
                              statusLabel = "Occupied";
                              badgeClass = "bg-success";
                            } else if (today > end) {
                              statusLabel = "Available";
                              badgeClass = "bg-info";
                            }
                          } else {
                            // Fallback to manual status if no trip dates
                            switch (cabin.status) {
                              case "Booked":
                                badgeClass = "bg-primary";
                                break;
                              case "Occupied":
                                badgeClass = "bg-success";
                                break;
                              case "Available":
                                badgeClass = "bg-info";
                                break;
                              default:
                                badgeClass = "bg-secondary";
                            }
                          }
                          
                          return (
                            <span className={`badge rounded-pill ${badgeClass}`}>
                              {statusLabel}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <div className="horizontal-action-buttons">
                          <button
                            className="action-rect-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(idx)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-rect-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(idx)}
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
        {/* Edit Modal */}
        {editIdx !== null && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 p-2">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Edit Cabin Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditIdx(null)}
                  ></button>
                </div>
                <div className="modal-body pt-2">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select rounded-pill border-primary"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    {statusOptions.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setEditIdx(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default CabinAdminDashboard;
