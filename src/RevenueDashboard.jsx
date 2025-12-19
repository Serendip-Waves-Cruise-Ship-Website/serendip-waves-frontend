import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDollarSign, FaChartLine, FaShip, FaCog, FaTrophy, FaArrowLeft } from 'react-icons/fa';
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
import './SuperAdminDashboard.css';
import logo from './assets/logo.png';

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

function RevenueDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
    cabin_revenue: [],
    services_revenue: [],
    monthly_revenue: [],
    ship_revenue: [],
    top_bookings: [],
    statistics: {
      avg_booking_value: 0,
      min_booking_value: 0,
      max_booking_value: 0
    }
  });

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('http://localhost/Project-I/backend/getRevenueData.php');
      const result = await response.json();
      
      if (result.success) {
        setRevenueData(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setLoading(false);
    }
  };

  // Monthly Revenue Trend Chart
  const monthlyRevenueChartData = {
    labels: revenueData.monthly_revenue.map(m => m.month_label),
    datasets: [{
      label: 'Revenue ($)',
      data: revenueData.monthly_revenue.map(m => parseFloat(m.revenue)),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  // Cabin Type Revenue Chart
  const cabinRevenueChartData = {
    labels: revenueData.cabin_revenue.map(c => c.cabin_type),
    datasets: [{
      label: 'Revenue ($)',
      data: revenueData.cabin_revenue.map(c => parseFloat(c.revenue)),
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe'
      ],
      borderWidth: 0
    }]
  };

  // Services Revenue Chart
  const servicesRevenueChartData = {
    labels: revenueData.services_revenue.slice(0, 5).map(s => s.facility_name),
    datasets: [{
      label: 'Revenue ($)',
      data: revenueData.services_revenue.slice(0, 5).map(s => parseFloat(s.total_revenue)),
      backgroundColor: 'rgba(102, 126, 234, 0.7)',
      borderColor: '#667eea',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  // Ship Revenue Chart
  const shipRevenueChartData = {
    labels: revenueData.ship_revenue.map(s => s.ship_name),
    datasets: [{
      data: revenueData.ship_revenue.map(s => parseFloat(s.revenue)),
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#fa709a',
        '#fee140'
      ],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.label + ': $' + context.parsed.toLocaleString();
          }
        }
      }
    }
  };

  // Calculate total services revenue
  const totalServicesRevenue = revenueData.services_revenue.reduce((sum, s) => sum + parseFloat(s.total_revenue || 0), 0);
  
  // Calculate combined total revenue (bookings + services)
  const combinedTotalRevenue = parseFloat(revenueData.total_revenue || 0) + totalServicesRevenue;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "0"
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#fff',
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        borderBottom: "1px solid #eee"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/super-admin')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#667eea',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <FaArrowLeft /> Back
          </button>
          <img src={logo} alt="Logo" style={{ height: '40px' }} />
          <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#1a237e' }}>
            <FaDollarSign style={{ marginRight: '8px', color: '#667eea' }} />
            Revenue Analytics Dashboard
          </div>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Super Admin Only
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'white', fontSize: '1.5rem', padding: '4rem' }}>
            Loading revenue data...
          </div>
        ) : (
          <>
            {/* Summary Cards - Key Metrics Only */}
            <div className="stats-overview" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FaDollarSign style={{ color: 'white', fontSize: '2rem' }} />
                </div>
                <div className="stat-content">
                  <h3>${combinedTotalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                  <span className="stat-change" style={{ fontSize: '0.85rem', color: '#666' }}>Bookings + Services</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <FaChartLine style={{ color: 'white', fontSize: '2rem' }} />
                </div>
                <div className="stat-content">
                  <h3>${parseFloat(revenueData.total_revenue || 0).toLocaleString()}</h3>
                  <p>Booking Revenue</p>
                  <span className="stat-change" style={{ fontSize: '0.85rem', color: '#666' }}>Cabins only</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <FaCog style={{ color: 'white', fontSize: '2rem' }} />
                </div>
                <div className="stat-content">
                  <h3>${totalServicesRevenue.toLocaleString()}</h3>
                  <p>Services Revenue</p>
                  <span className="stat-change" style={{ fontSize: '0.85rem', color: '#666' }}>Facilities only</span>
                </div>
              </div>
            </div>

            {/* Main Chart - Monthly Trends */}
            <div className="chart-container" style={{ marginBottom: '2rem' }}>
              <h4>
                <FaChartLine style={{ marginRight: '0.5rem', color: '#667eea' }} />
                Revenue Trends (Last 12 Months)
              </h4>
              <div style={{ height: '350px', padding: '1rem' }}>
                <Line data={monthlyRevenueChartData} options={chartOptions} />
              </div>
            </div>

            {/* Revenue Breakdown Charts */}
            <div className="charts-section" style={{ marginBottom: '2rem' }}>
              <div className="chart-container">
                <h4>
                  <FaDollarSign style={{ marginRight: '0.5rem', color: '#667eea' }} />
                  Revenue by Cabin Type
                </h4>
                <div style={{ height: '300px', padding: '1rem' }}>
                  <Doughnut data={cabinRevenueChartData} options={doughnutOptions} />
                </div>
              </div>

              <div className="chart-container">
                <h4>
                  <FaShip style={{ marginRight: '0.5rem', color: '#667eea' }} />
                  Revenue by Ship
                </h4>
                <div style={{ height: '300px', padding: '1rem' }}>
                  <Doughnut data={shipRevenueChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            {/* Detailed Revenue Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              {/* Cabin Revenue Details */}
              <div className="chart-container">
                <h4>
                  <FaDollarSign style={{ marginRight: '0.5rem', color: '#667eea' }} />
                  Cabin Type Performance
                </h4>
                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#6c5ce7', borderBottom: 'none' }}>
                    <tr>
                      <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff' }}>Cabin Type</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff' }}>Bookings</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff' }}>Revenue</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#ffffff' }}>Avg/Booking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.cabin_revenue.map((cabin, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{cabin.cabin_type}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{cabin.bookings_count}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#667eea' }}>
                          ${parseFloat(cabin.revenue).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>
                          ${(parseFloat(cabin.revenue) / cabin.bookings_count).toFixed(0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Bookings */}
              <div className="chart-container">
                <h4>
                  <FaTrophy style={{ marginRight: '0.5rem', color: '#667eea' }} />
                  Top 10 High-Value Bookings
                </h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                      <tr style={{ borderBottom: '2px solid #667eea' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Customer</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Ship</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.top_bookings.map((booking, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px', fontSize: '0.9rem' }}>{booking.customer_name}</td>
                          <td style={{ padding: '10px', color: '#666' }}>{booking.ship_name}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#667eea' }}>
                            ${parseFloat(booking.total_cost).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RevenueDashboard;
