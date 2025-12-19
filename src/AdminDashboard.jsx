import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { FaBook, FaUtensils, FaBed, FaRoute, FaUsers, FaShip, FaInfoCircle, FaDollarSign, FaSwimmingPool, FaArrowUp, FaChartLine, FaCalendarAlt, FaExclamationTriangle, FaMapMarkerAlt } from "react-icons/fa";
import "./SuperAdminDashboard.css"; // Reuse the SuperAdmin styles
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import logo from './assets/logo.png';
import { Modal, Button } from "react-bootstrap";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const iconStyle = {
  fontSize: "2.2rem",
  color: "#7c5fe6",
  marginBottom: "0.7rem",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeCruises: 0,
    revenue: 0,
    activePassengers: 0,
    revenueChange: 0,
    bookingsChange: 0,
    pendingEnquiries: 0,
    upcomingDepartures: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch bookings
        const bookingsRes = await fetch('http://localhost/Project-I/backend/getAllBookings.php');
        const bookingsData = await bookingsRes.json();
        const totalBookings = bookingsData.success ? bookingsData.bookings.length : 0;
        
        // Calculate total passengers from bookings (adults + children)
        const activePassengers = bookingsData.success 
          ? bookingsData.bookings.reduce((sum, b) => sum + (parseInt(b.adults) || 0) + (parseInt(b.children) || 0), 0)
          : 0;
        
        // Fetch itineraries to count unique destinations
        const itinerariesRes = await fetch('http://localhost/Project-I/backend/getItineraries.php');
        const itinerariesData = await itinerariesRes.json();
        const activeCruises = Array.isArray(itinerariesData) 
          ? new Set(itinerariesData.map(i => i.route).filter(r => r)).size 
          : 0;
        
        // Calculate revenue from bookings
        const revenue = bookingsData.success 
          ? bookingsData.bookings.reduce((sum, b) => sum + (parseFloat(b.total_cost) || 0), 0)
          : 0;
        
        // Fetch enquiries
        const enquiriesRes = await fetch('http://localhost/Project-I/backend/getEnquiries.php');
        const enquiriesData = await enquiriesRes.json();
        const pendingEnquiries = enquiriesData.success 
          ? enquiriesData.enquiries.filter(e => !e.reply || e.reply === '').length 
          : 0;
        
        // Calculate upcoming departures (within next 7 days)
        const upcomingDepartures = bookingsData.success
          ? bookingsData.bookings.filter(b => {
              if (!b.departure_date) return false;
              const depDate = new Date(b.departure_date);
              const today = new Date();
              const weekFromNow = new Date();
              weekFromNow.setDate(today.getDate() + 7);
              return depDate >= today && depDate <= weekFromNow;
            }).length
          : 0;
        
        setStats({
          totalBookings,
          activeCruises,
          revenue,
          activePassengers,
          revenueChange: 6.2,
          bookingsChange: 9.8,
          pendingEnquiries,
          upcomingDepartures
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutModal(false);
  };
  
  // Chart data for monthly bookings
  const monthlyBookingsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Bookings',
      data: [32, 28, 35, 42, 48, 55, 58, 62, 59, 65, 71, 78],
      backgroundColor: 'rgba(102, 126, 234, 0.7)',
      borderColor: '#667eea',
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 30
    }]
  };
  
  const monthlyBookingsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 12 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 12 }
        }
      }
    }
  };
  
  // Passenger distribution chart
  const passengerTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'New Passengers',
      data: [145, 178, 165, 192],
      borderColor: '#764ba2',
      backgroundColor: 'rgba(118, 75, 162, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#764ba2',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };
  
  const passengerTrendsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 1rem",
      }}
    >
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
        minHeight: "60px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        borderBottom: "1px solid #eee"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: '45px', width: 'auto', maxWidth: '60px', cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => navigate('/#top')}
          />
          <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#1a237e', letterSpacing: '0.5px' }}>
            Admin Dashboard
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
      <div style={{ marginTop: "80px", width: "100%", maxWidth: "1400px", padding: "0 1rem" }}>
        <h2 style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: "3rem",
          marginBottom: "2rem",
          textAlign: "center",
          letterSpacing: "0.5px",
          textShadow: "0 4px 24px rgba(30,58,138,0.13)"
        }}>
          Welcome Admin!
        </h2>
        
        {/* Summary Statistics Cards */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <FaBook style={{ color: 'white', fontSize: '1.8rem' }} />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : stats.totalBookings.toLocaleString()}</h3>
              <p>Total Bookings</p>
              <span className="stat-change positive">
                <FaArrowUp /> +{stats.bookingsChange}% this month
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <FaMapMarkerAlt style={{ color: 'white', fontSize: '1.8rem' }} />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : stats.activeCruises}</h3>
              <p>Active Destinations</p>
              <span className="stat-change">
                <FaCalendarAlt /> {stats.upcomingDepartures} departing soon
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <FaDollarSign style={{ color: 'white', fontSize: '1.8rem' }} />
            </div>
            <div className="stat-content">
              <h3>${loading ? '...' : (stats.revenue / 1000).toFixed(0)}K</h3>
              <p>Revenue (Total)</p>
              <span className="stat-change positive">
                <FaArrowUp /> +{stats.revenueChange}% vs last month
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <FaUsers style={{ color: 'white', fontSize: '1.8rem' }} />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : stats.activePassengers.toLocaleString()}</h3>
              <p>Total Passengers</p>
              <span className="stat-change">
                Across all bookings
              </span>
            </div>
          </div>
        </div>
        
        {/* Alerts Section */}
        {stats.pendingEnquiries > 0 && (
          <div className="dashboard-alerts">
            <div className="alert-card info">
              <FaInfoCircle style={{ fontSize: '2rem', color: '#2196f3' }} />
              <div>
                <h5>Pending Enquiries</h5>
                <p>{stats.pendingEnquiries} customer enquiries awaiting response</p>
                <button className="alert-action" onClick={() => navigate('/enquiries')}>
                  View Enquiries
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h4>
              <FaChartLine style={{ marginRight: '0.5rem', color: '#667eea' }} />
              Monthly Bookings (2025)
            </h4>
            <div style={{ height: '280px', padding: '1rem' }}>
              <Bar data={monthlyBookingsData} options={monthlyBookingsOptions} />
            </div>
          </div>
          
          <div className="chart-container">
            <h4>
              <FaUsers style={{ marginRight: '0.5rem', color: '#667eea' }} />
              Passenger Growth (This Month)
            </h4>
            <div style={{ height: '280px', padding: '1rem' }}>
              <Line data={passengerTrendsData} options={passengerTrendsOptions} />
            </div>
          </div>
        </div>
        
        {/* Management Sections */}
        <h3 style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "2rem",
          marginBottom: "1.5rem",
          marginTop: "2.5rem",
          textAlign: "center",
          letterSpacing: "0.5px"
        }}>
          Management Sections
        </h3>
        
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "3rem",
            maxWidth: 1400,
            width: "100%",
          }}
        >
          {/* Bookings Column */}
          <div className="admin-column">
            <h3 className="admin-column-title">📋 Bookings</h3>
            <Link to="/booking-overview" className="admin-dashboard-btn">
              <FaBook style={iconStyle} />
              Booking Overview
            </Link>
            <Link to="/passenger-management" className="admin-dashboard-btn">
              <FaUsers style={iconStyle} />
              Passenger Management
            </Link>
            <Link to="/enquiries" className="admin-dashboard-btn">
              <FaInfoCircle style={iconStyle} />
              Customer Enquiries
            </Link>
          </div>

          {/* Route & Cruises Column */}
          <div className="admin-column">
            <h3 className="admin-column-title">🚢 Route & Cruises</h3>
            <Link to="/manage-cruises" className="admin-dashboard-btn">
              <FaShip style={iconStyle} />
              Cruise Management
            </Link>
            <Link to="/itinerary-management" className="admin-dashboard-btn">
              <FaRoute style={iconStyle} />
              Itinerary Management
            </Link>
            <Link to="/itinerary-details" className="admin-dashboard-btn">
              <FaInfoCircle style={iconStyle} />
              Itinerary Details
            </Link>
            <Link to="/dynamic-pricing" className="admin-dashboard-btn">
              <FaDollarSign style={iconStyle} />
              Dynamic Pricing for Cabins
            </Link>
          </div>

          {/* Facilities Column */}
          <div className="admin-column">
            <h3 className="admin-column-title">🏊 Facilities</h3>
            <Link to="/facility-management?from=admin" className="admin-dashboard-btn">
              <FaSwimmingPool style={iconStyle} />
              Facility Management
            </Link>
            <Link to="/facilities-dashboard?from=admin" className="admin-dashboard-btn">
              <FaSwimmingPool style={iconStyle} />
              Facilities Dashboard
            </Link>
            <Link to="/cabin-admin" className="admin-dashboard-btn">
              <FaBed style={iconStyle} />
              Cabin Management
            </Link>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Would you like to log out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
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

export default AdminDashboard;