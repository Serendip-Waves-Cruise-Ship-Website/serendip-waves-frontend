import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { AuthContext } from './AuthContext';
import logo from './assets/logo.png';
import { Modal, Button } from 'react-bootstrap';

const ChefDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  
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
    <div 
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "0",
        margin: "0"
      }}
    >
      {/* Header with Logo and Logout */}
      <div className="d-flex justify-content-between align-items-center py-2 px-4" style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", minHeight: "60px" }}>
        <div className="d-flex align-items-center">
          <img src={logo} alt="Logo" width="40" height="40" className="me-2" />
          <h2 className="text-dark mb-0 fw-bold">Chef Dashboard</h2>
        </div>
        <button 
          className="btn text-white fw-bold px-4 py-2"
          style={{
            background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
            border: "none",
            borderRadius: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="container-fluid px-4 pb-4">
        <h1 className="text-center mb-5 text-white" style={{
          fontSize: "3.5rem",
          fontWeight: "bold",
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          marginTop: "2rem"
        }}>
          Welcome Chef...!
        </h1>
        <div className="row justify-content-center g-4">
          {/* Section Headers */}
          <div className="col-12">
            <div className="row text-center mb-4">
              <div className="col-md-4">
                <h3 className="text-white fw-bold">🍽️ Kitchen Operations</h3>
              </div>
              <div className="col-md-4">
                <h3 className="text-white fw-bold">📊 Analytics</h3>
              </div>
              <div className="col-md-4">
                <h3 className="text-white fw-bold">🏪 Inventory</h3>
              </div>
            </div>
          </div>

          {/* Chef Management Cards */}
          <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
            <Link 
              to="/meals-options-dashboard" 
              className="dashboard-btn"
              style={{ 
                textDecoration: "none",
                width: "280px",
                height: "140px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333",
                transition: "all 0.3s ease",
                cursor: "pointer",
                margin: "10px",
                position: "relative",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px) scale(1.05)";
                e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                e.target.style.background = "rgba(255,255,255,1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                e.target.style.background = "rgba(255,255,255,0.95)";
              }}
            >
              <div style={{ fontSize: "3rem", color: "#667eea", marginBottom: "10px" }}>
                <FaUtensils />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#333" }}>Meal Section</span>
            </Link>
          </div>
          
          <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
            <Link 
              to="/meals-dashboard" 
              className="dashboard-btn"
              style={{ 
                textDecoration: "none",
                width: "280px",
                height: "140px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333",
                transition: "all 0.3s ease",
                cursor: "pointer",
                margin: "10px",
                position: "relative",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px) scale(1.05)";
                e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                e.target.style.background = "rgba(255,255,255,1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                e.target.style.background = "rgba(255,255,255,0.95)";
              }}
            >
              <div style={{ fontSize: "3rem", color: "#764ba2", marginBottom: "10px" }}>
                <FaUtensils />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#333" }}>Meals Predictions</span>
            </Link>
          </div>
          
          <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
            <Link 
              to="/food-inventory-management" 
              className="dashboard-btn"
              style={{ 
                textDecoration: "none",
                width: "280px",
                height: "140px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333",
                transition: "all 0.3s ease",
                cursor: "pointer",
                margin: "10px",
                position: "relative",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px) scale(1.05)";
                e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                e.target.style.background = "rgba(255,255,255,1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                e.target.style.background = "rgba(255,255,255,0.95)";
              }}
            >
              <div style={{ fontSize: "3rem", color: "#ee5a24", marginBottom: "10px" }}>
                <FaUtensils />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#333" }}>Pantry</span>
            </Link>
          </div>
        </div>
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
};

export default ChefDashboard;
