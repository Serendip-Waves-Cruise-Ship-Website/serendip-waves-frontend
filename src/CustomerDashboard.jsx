import React, { useContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

import Navbar from "./Navbar";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const { currentUser, loading, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("my-booking");
  const [bookings, setBookings] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");






  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await fetch('http://localhost/Project-I/backend/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'get_bookings', email: currentUser.email })
        });
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch {
        setBookings([]);
      }
    };
    fetchBookings();
  }, [currentUser]);

  // When switching to edit-profile, initialize form
  useEffect(() => {
    if (activeSection === "edit-profile" && currentUser) {
      setEditForm({
        full_name: currentUser.full_name || currentUser.name || "",
        email: currentUser.email || "",
        date_of_birth: currentUser.date_of_birth || currentUser.dob || "",
        gender: currentUser.gender || "",
        phone_number: currentUser.phone_number || currentUser.phone || "",
        passport_number: currentUser.passport_number || currentUser.passport || "",
        country: currentUser.country || "",
      });
      setEditError("");
      setEditSuccess("");
    }
  }, [activeSection, currentUser]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    
    try {
      // Client-side validation
      if (!editForm?.full_name?.trim()) {
        setEditError("Full name is required");
        setEditLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("id", currentUser.id);
      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value || '');
      });

      console.log('Submitting profile update for user ID:', currentUser.id);
      console.log('Form data being sent:', editForm);
      
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }
      
      // Update profile
      const response = await fetch("http://localhost/Project-I/backend/updateProfile.php", {
        method: "POST",
        body: formData,
      });

      // Always try to read the response body, even for error statuses
      let updateData;
      try {
        updateData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        throw new Error(`Server returned ${response.status} but response is not valid JSON`);
      }

      console.log('Profile update response:', updateData);
      
      if (updateData.success) {
        // Always show success message if update succeeded
        setProfileSuccessMsg("Profile updated successfully!");
        setActiveSection("my-profile");
        
        // Update current user data
        if (updateData.data) {
          localStorage.setItem("currentUser", JSON.stringify(updateData.data));
          setCurrentUser(updateData.data);
        }
        
        setTimeout(() => setProfileSuccessMsg(""), 3000);
      } else {
        // Show the specific error message from the server
        setEditError(updateData.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.message.includes('CORS')) {
        setEditError("Connection error: Please check if the server is running.");
      } else if (error.message.includes('HTTP error')) {
        setEditError("Server error: Please try again later.");
      } else {
        setEditError("An error occurred while updating your profile. Please try again.");
      }
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Home Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <ul className="sidebar-nav">
            <li>
              <a 
                href="#dashboard" 
                className={activeSection === "dashboard" ? "active" : ""}
                onClick={() => setActiveSection("dashboard")}
              >
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="#my-booking" 
                className={activeSection === "my-booking" ? "active" : ""}
                onClick={() => setActiveSection("my-booking")}
              >
                <i className="fas fa-calendar-check"></i>
                My Bookings
              </a>
            </li>
            <li>
              <a 
                href="#my-profile" 
                className={activeSection === "my-profile" ? "active" : ""}
                onClick={() => setActiveSection("my-profile")}
              >
                <i className="fas fa-user"></i>
                My Profile
              </a>
            </li>
            <li>
              <a 
                href="#meal-preferences" 
                className={activeSection === "meal-preferences" ? "active" : ""}
                onClick={() => setActiveSection("meal-preferences")}
              >
                <i className="fas fa-utensils"></i>
                Meal Preferences
              </a>
            </li>
            <li>
              <a 
                href="#facility-preferences" 
                className={activeSection === "facility-preferences" ? "active" : ""}
                onClick={() => setActiveSection("facility-preferences")}
              >
                <i className="fas fa-swimming-pool"></i>
                Facility Preferences
              </a>
            </li>
          </ul>
        </div>
        {/* Content Area */}
        <div className="content-area">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-left">
              <h1>Welcome back, {currentUser?.full_name || 'Customer'}!</h1>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main>
            {/* Welcome Message */}
            <div className="welcome-section">
              <p style={{ fontWeight: 500, fontSize: '1.3rem', marginBottom: 0 }}>
                "The sea, once it casts its spell, holds one in its net of wonder forever."
              </p>
              <span className="quote-author">— Jacques Cousteau</span>
              <p className="description">
                Ready to embark on your next adventure? Explore our amazing cruise destinations and create unforgettable memories.
              </p>
            </div>

            {activeSection === "my-booking" && (
              <div>
                <h2 className="section-title">My Booking History</h2>
                {loading ? (
                  <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p>No bookings found. Start your journey by making a booking!</p>
                ) : (
                  <table className="booking-table">
                    <thead>
                      <tr>
                        <th>Cruise</th>
                        <th>Destination</th>
                        <th>Cabin Type</th>
                        <th title="Itinerary Start Date">Departure</th>
                        <th title="Itinerary End Date">Return</th>
                        <th>Guests</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Preferences</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.booking_id || b.id}>
                          <td>{b.cruise_title || b.ship_name || '-'}</td>
                          <td>{b.destination || '-'}</td>
                          <td>{b.cabin_type || b.room_type}</td>
                          <td title="Itinerary Start Date">{b.departure_date ? new Date(b.departure_date).toLocaleDateString() : '-'}</td>
                          <td title="Itinerary End Date">{b.return_date ? new Date(b.return_date).toLocaleDateString() : '-'}</td>
                          <td>{b.total_guests || b.number_of_guests}</td>
                          <td>${parseFloat(b.total_price).toLocaleString()}</td>
                          <td>
                            {(() => {
                              const now = new Date();
                              const dep = b.departure_date ? new Date(b.departure_date) : null;
                              const ret = b.return_date ? new Date(b.return_date) : null;
                              if (dep && ret) {
                                if (now < dep) return <span className="booking-status upcoming">Upcoming</span>;
                                if (now > ret) return <span className="booking-status completed">Completed</span>;
                                if (now >= dep && now <= ret) return <span className="booking-status ongoing">Ongoing</span>;
                              }
                              return <span className={`booking-status status-${b.booking_status}`}>{b.booking_status}</span>;
                            })()}
                          </td>
                          <td>
                            <div className="preference-buttons">
                              <button 
                                className="pref-btn meal-btn"
                                onClick={() => navigate(`/meals/${b.booking_id || b.id}`)}
                                title="Meal Preferences"
                              >
                                🍽️ Meals
                              </button>
                              <button 
                                className="pref-btn facility-btn"
                                onClick={() => navigate(`/facilities/${b.booking_id || b.id}`)}
                                title="Facility Preferences"
                              >
                                🏊 Facilities
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeSection === "meal-preferences" && (
              <div>
                <h2 className="section-title">Meal Preferences</h2>
                {bookings.length === 0 ? (
                  <div className="no-bookings-message">
                    <p>No bookings found. Make a booking first to set meal preferences!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/')}
                    >
                      Browse Cruises
                    </button>
                  </div>
                ) : (
                  <div className="preferences-grid">
                    <p className="mb-4">Select a booking to set your meal preferences:</p>
                    {bookings.map(b => (
                      <div key={b.booking_id || b.id} className="preference-card">
                        <div className="card-header">
                          <h5>{b.cruise_title || b.ship_name || 'Cruise Booking'}</h5>
                          <small className="text-muted">Booking ID: {b.booking_id || b.id}</small>
                        </div>
                        <div className="card-body">
                          <p><strong>Destination:</strong> {b.destination || '-'}</p>
                          <p><strong>Departure:</strong> {b.departure_date ? new Date(b.departure_date).toLocaleDateString() : '-'}</p>
                          <p><strong>Guests:</strong> {b.total_guests || b.number_of_guests}</p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => navigate(`/meals/${b.booking_id || b.id}`)}
                          >
                            <i className="fas fa-utensils me-2"></i>
                            Set Meal Preferences
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "facility-preferences" && (
              <div>
                <h2 className="section-title">Facility Preferences</h2>
                {bookings.length === 0 ? (
                  <div className="no-bookings-message">
                    <p>No bookings found. Make a booking first to set facility preferences!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/')}
                    >
                      Browse Cruises
                    </button>
                  </div>
                ) : (
                  <div className="preferences-grid">
                    <p className="mb-4">Select a booking to set your facility preferences:</p>
                    {bookings.map(b => (
                      <div key={b.booking_id || b.id} className="preference-card">
                        <div className="card-header">
                          <h5>{b.cruise_title || b.ship_name || 'Cruise Booking'}</h5>
                          <small className="text-muted">Booking ID: {b.booking_id || b.id}</small>
                        </div>
                        <div className="card-body">
                          <p><strong>Destination:</strong> {b.destination || '-'}</p>
                          <p><strong>Departure:</strong> {b.departure_date ? new Date(b.departure_date).toLocaleDateString() : '-'}</p>
                          <p><strong>Guests:</strong> {b.total_guests || b.number_of_guests}</p>
                          <button 
                            className="btn btn-info"
                            onClick={() => navigate(`/facilities/${b.booking_id || b.id}`)}
                          >
                            <i className="fas fa-swimming-pool me-2"></i>
                            Set Facility Preferences
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "my-profile" && (
              <div>
                {profileSuccessMsg && <div className="alert alert-success">{profileSuccessMsg}</div>}
                <div className="profile-section-header">
                  <h2 className="section-title">My Profile</h2>
                  <button 
                    className="edit-profile-btn"
                    onClick={() => {
                      console.log('Edit Profile button clicked');
                      setActiveSection("edit-profile");
                    }}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                </div>
                
                <div className="profile-info-card">
                  <div className="profile-info-item">
                    <div className="info-label">
                      <i className="fas fa-user"></i>
                      Full Name
                    </div>
                    <div className="info-value">
                      {currentUser?.full_name || currentUser?.name || "Not provided"}
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="info-label">
                      <i className="fas fa-envelope"></i>
                      Email
                    </div>
                    <div className="info-value">
                      {currentUser?.email || "Not provided"}
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="info-label">
                      <i className="fas fa-calendar"></i>
                      Date of Birth
                    </div>
                    <div className="info-value">
                      {currentUser?.date_of_birth || currentUser?.dob ? 
                        new Date(currentUser.date_of_birth || currentUser.dob).toLocaleDateString() : 
                        "Not provided"}
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="info-label">
                      <i className="fas fa-venus-mars"></i>
                      Gender
                    </div>
                    <div className="info-value">
                      {currentUser?.gender || "Not provided"}
                    </div>
                  </div>
                  
                  {currentUser?.phone_number || currentUser?.phone ? (
                    <div className="profile-info-item">
                      <div className="info-label">
                        <i className="fas fa-phone"></i>
                        Phone Number
                      </div>
                      <div className="info-value">
                        {currentUser?.phone_number || currentUser?.phone}
                      </div>
                    </div>
                  ) : null}
                  
                  {currentUser?.country ? (
                    <div className="profile-info-item">
                      <div className="info-label">
                        <i className="fas fa-globe"></i>
                        Country
                      </div>
                      <div className="info-value">
                        {currentUser?.country}
                      </div>
                    </div>
                  ) : null}
                  
                  {currentUser?.passport_number || currentUser?.passport ? (
                    <div className="profile-info-item">
                      <div className="info-label">
                        <i className="fas fa-passport"></i>
                        Passport Number
                      </div>
                      <div className="info-value">
                        {currentUser?.passport_number || currentUser?.passport}
                      </div>
                    </div>
                  ) : null}
                  
                  {currentUser?.created_at && (
                    <div className="profile-info-item">
                      <div className="info-label">
                        <i className="fas fa-calendar-alt"></i>
                        Member Since
                      </div>
                      <div className="info-value">
                        {new Date(currentUser.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === "edit-profile" && (
              <div className="edit-profile-section">
                <h2 className="section-title">Edit Profile</h2>
                <form className="edit-profile-form" onSubmit={handleEditProfileSubmit} style={{ maxWidth: 500, margin: "0 auto" }}>
                  {editSuccess && <div className="alert alert-success">{editSuccess}</div>}
                  {editError && <div className="alert alert-danger">{editError}</div>}
                  <div className="form-group mb-3">
                    <label>Full Name</label>
                    <input type="text" name="full_name" className="form-control" value={editForm?.full_name || ""} onChange={handleEditFormChange} required />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control" 
                      value={editForm?.email || ""} 
                      readOnly 
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      title="Email address cannot be changed for security reasons"
                    />
                    <small className="text-muted">Email address cannot be changed for security reasons</small>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label>Date of Birth</label>
                    <input type="date" name="date_of_birth" className="form-control" value={editForm?.date_of_birth ? editForm.date_of_birth.slice(0,10) : ""} onChange={handleEditFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Gender</label>
                    <select name="gender" className="form-control" value={editForm?.gender || ""} onChange={handleEditFormChange}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group mb-3">
                    <label>Phone Number <small className="text-muted">(Cannot be changed)</small></label>
                    <input 
                      type="text" 
                      name="phone_number" 
                      className="form-control" 
                      value={editForm?.phone_number || ""} 
                      readOnly 
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      title="Phone number cannot be edited for security reasons"
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Country <small className="text-muted">(Cannot be changed)</small></label>
                    <input 
                      type="text" 
                      name="country" 
                      className="form-control" 
                      value={editForm?.country || ""} 
                      readOnly 
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      title="Country cannot be edited for security reasons"
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Passport Number</label>
                    <input type="text" name="passport_number" className="form-control" value={editForm?.passport_number || ""} onChange={handleEditFormChange} />
                  </div>
                  <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-secondary" onClick={() => setActiveSection("my-profile")}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard; 