import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { FaBook, FaUtensils, FaBed, FaRoute, FaUsers, FaShip, FaInfoCircle, FaDollarSign, FaSwimmingPool, FaArrowUp, FaChartLine, FaCalendarAlt, FaExclamationTriangle, FaMapMarkerAlt } from "react-icons/fa";
import "./SuperAdminDashboard.css";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import logo from './assets/logo.png';
import { Modal, Button } from "react-bootstrap";
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
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
  ArcElement,
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

function SuperAdminDashboard() {
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
    lowStockItems: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  // Chart data state
  const [chartData, setChartData] = useState({
    monthlyBookings: [0, 0, 0, 0, 0, 0],
    monthLabels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    cabinRevenue: {
      Suite: 0,
      Balcony: 0,
      'Ocean View': 0,
      Interior: 0
    }
  });

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
          ? bookingsData.bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0)
          : 0;
        
        // Fetch enquiries
        const enquiriesRes = await fetch('http://localhost/Project-I/backend/getEnquiries.php');
        const enquiriesData = await enquiriesRes.json();
        const pendingEnquiries = enquiriesData.success 
          ? enquiriesData.enquiries.filter(e => !e.reply || e.reply === '').length 
          : 0;
        
        // Fetch inventory for low stock
        const inventoryRes = await fetch('http://localhost/Project-I/backend/getInventory.php');
        const inventoryData = await inventoryRes.json();
        const lowStockItems = Array.isArray(inventoryData)
          ? inventoryData.filter(item => item.status === 'Low Stock' || item.quantity_in_stock < 20).length
          : 0;
        
        // Calculate chart data from bookings
        if (bookingsData.success && bookingsData.bookings.length > 0) {
          // 1. Monthly bookings trend (last 6 months)
          const monthCounts = [0, 0, 0, 0, 0, 0];
          const monthNames = [];
          const today = new Date();
          
          // Generate last 6 months labels
          for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthNames.push(d.toLocaleString('default', { month: 'short' }));
          }
          
          // Count bookings per month
          bookingsData.bookings.forEach(booking => {
            const bookingDate = new Date(booking.booking_date || booking.created_at);
            const monthsAgo = (today.getFullYear() - bookingDate.getFullYear()) * 12 + 
                             (today.getMonth() - bookingDate.getMonth());
            
            if (monthsAgo >= 0 && monthsAgo < 6) {
              monthCounts[5 - monthsAgo]++;
            }
          });
          
          // 2. Revenue by cabin type
          const cabinRevenue = {
            Suite: 0,
            Balcony: 0,
            'Ocean View': 0,
            Interior: 0
          };
          
          bookingsData.bookings.forEach(booking => {
            const cost = parseFloat(booking.total_price) || 0;
            const cabinType = booking.room_type || 'Interior';
            
            if (cabinRevenue.hasOwnProperty(cabinType)) {
              cabinRevenue[cabinType] += cost;
            } else {
              cabinRevenue.Interior += cost;
            }
          });
          
          setChartData({
            monthlyBookings: monthCounts,
            monthLabels: monthNames,
            cabinRevenue
          });
        }
        
        setStats({
          totalBookings,
          activeCruises,
          revenue,
          activePassengers,
          revenueChange: 8.5,
          bookingsChange: 12.3,
          pendingEnquiries,
          lowStockItems
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
    navigate("/");
    setShowLogoutModal(false);
  };
  
  // Chart data for booking trends (now using REAL data)
  const bookingTrendsData = {
    labels: chartData.monthLabels,
    datasets: [{
      label: 'Bookings',
      data: chartData.monthlyBookings, // ← Real data from database
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };
  
  const bookingTrendsOptions = {
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
  
  // Revenue by cabin type chart (now using REAL data)
  const totalRevenue = Object.values(chartData.cabinRevenue).reduce((sum, val) => sum + val, 0);
  const revenueByTypeData = {
    labels: ['Suite', 'Balcony', 'Ocean View', 'Interior'],
    datasets: [{
      data: [
        totalRevenue > 0 ? Math.round((chartData.cabinRevenue.Suite / totalRevenue) * 100) : 0,
        totalRevenue > 0 ? Math.round((chartData.cabinRevenue.Balcony / totalRevenue) * 100) : 0,
        totalRevenue > 0 ? Math.round((chartData.cabinRevenue['Ocean View'] / totalRevenue) * 100) : 0,
        totalRevenue > 0 ? Math.round((chartData.cabinRevenue.Interior / totalRevenue) * 100) : 0
      ], // ← Real percentages from database
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe'
      ],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };
  
  const revenueByTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
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
            Super Admin Dashboard
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
          Welcome Boss...!
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
                <FaCalendarAlt /> All operational
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
        {(stats.pendingEnquiries > 0 || stats.lowStockItems > 0) && (
          <div className="dashboard-alerts">
            {stats.pendingEnquiries > 0 && (
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
            )}
            
            {stats.lowStockItems > 0 && (
              <div className="alert-card warning">
                <FaExclamationTriangle style={{ fontSize: '2rem', color: '#ff9800' }} />
                <div>
                  <h5>Low Stock Alert</h5>
                  <p>{stats.lowStockItems} items below minimum threshold</p>
                  <button className="alert-action" onClick={() => navigate('/food-inventory-management')}>
                    View Inventory
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h4>
              <FaChartLine style={{ marginRight: '0.5rem', color: '#667eea' }} />
              Booking Trends (Last 6 Months)
            </h4>
            <div style={{ height: '280px', padding: '1rem' }}>
              <Line data={bookingTrendsData} options={bookingTrendsOptions} />
            </div>
          </div>
          
          <div className="chart-container">
            <h4>
              <FaDollarSign style={{ marginRight: '0.5rem', color: '#667eea' }} />
              Revenue Distribution by Cabin Type
            </h4>
            <div style={{ height: '280px', padding: '1rem' }}>
              <Doughnut data={revenueByTypeData} options={revenueByTypeOptions} />
            </div>
          </div>
        </div>
        
        {/* Quick Access - Revenue Dashboard */}
        <div style={{ 
          textAlign: 'center', 
          margin: '2.5rem 0 1.5rem 0',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => navigate('/revenue-dashboard')}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(240, 147, 251, 0.4)',
              transition: 'all 0.3s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 32px rgba(240, 147, 251, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(240, 147, 251, 0.4)';
            }}
          >
            <FaDollarSign style={{ fontSize: '1.3rem' }} />
            View Complete Revenue Analytics Dashboard
            <FaArrowUp style={{ fontSize: '1rem' }} />
          </button>
          <p style={{ color: 'white', marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.9 }}>
            Deep dive into revenue trends, cabin & services breakdown, and financial insights
          </p>
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
            <Link to="/facility-management?from=super-admin" className="admin-dashboard-btn">
              <FaSwimmingPool style={iconStyle} />
              Facility Management
            </Link>
            <Link to="/facilities-dashboard?from=super-admin" className="admin-dashboard-btn">
              <FaSwimmingPool style={iconStyle} />
              Facilities Dashboard
            </Link>
            <Link to="/cabin-admin" className="admin-dashboard-btn">
              <FaBed style={iconStyle} />
              Cabin Management
            </Link>
          </div>

          {/* Chef Column */}
          <div className="admin-column">
            <h3 className="admin-column-title">👨‍🍳 Chef</h3>
            <Link to="/meals-options-dashboard" className="admin-dashboard-btn">
              <FaUtensils style={iconStyle} />
              Meal Section
            </Link>
            <Link to="/meals-dashboard" className="admin-dashboard-btn">
              <FaUtensils style={iconStyle} />
              Meals Predictions
            </Link>
            <Link to="/food-inventory-management" className="admin-dashboard-btn">
              <FaUtensils style={iconStyle} />
              Pantry
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

export default SuperAdminDashboard;
