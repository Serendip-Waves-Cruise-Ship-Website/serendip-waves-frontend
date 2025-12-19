

import HeroImage from './assets/cruse home page.jpg';

// Optimized Hero Section as a component
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import DestinationsPage from "./DestinationsPage";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AboutSection from './AboutSection';
import { AuthContext } from './AuthContext';

// Optimized Hero Section as a component
const Hero = ({ bookingError }) => (
  <section
    id="home"
    className="hero-section"
    style={{
      width: "100vw",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      marginTop: "-80px",
      paddingTop: "80px",
      backgroundImage: `url(${HeroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: 'brightness(1.2)',
    }}
  >
    {/* Overlay */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(16,24,32,0.4)",
        zIndex: 1,
      }}
    />
    {/* Hero Content */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        height: "100vh",
        maxWidth: "700px",
        margin: "0 auto 0 0",
        color: "#fff",
        textAlign: "left",
        padding: "15vh 2vw 0 7vw"
      }}
    >
      <h1 style={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 300,
        fontSize: "3.2rem",
        lineHeight: 1.3,
        marginBottom: "1.2rem",
        letterSpacing: "0.1em",
        textShadow: "0 2px 12px rgba(0,0,0,0.6)"
      }}>
        EXPLORE THE WORLD
        <br style={{ lineHeight: 2.5 }} />
        <span style={{
          fontFamily: "'Cinzel', 'Georgia', serif",
          fontStyle: "normal",
          fontWeight: 600,
          letterSpacing: "0.05em",
          display: "block",
          marginTop: "1.0rem"
        }}>
          SERENDIP WAVES
        </span>
      </h1>
      <p style={{
        fontSize: "1.1rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 400,
        marginBottom: "2.2rem",
        color: "#e0e0e0",
        textShadow: "0 1px 6px rgba(0,0,0,0.18)"
      }}>
        WHERE LUXURY MEETS THE SEA<br />EVERY JOURNEY, A MASTERPIECE.
      </p>
      <Link 
        to="/destinations"
        style={{
          display: "inline-block",
          padding: "14px 40px",
          background: "rgba(255, 255, 255, 0.95)",
          color: "#1a237e",
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: "4px",
          border: "2px solid #fff",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "#fff";
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255, 255, 255, 0.95)";
          e.target.style.color = "#1a237e";
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
        }}
      >
        Explore Destinations
      </Link>
    </div>
  </section>
);

// Contact Section
const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess('');
    setError('');
  };

  const { isAuthenticated, currentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    // Require login as customer
    const role = currentUser?.role?.toLowerCase();
    if (!isAuthenticated || role !== 'customer') {
      setError('Please login to the website as a customer to submit an enquiry.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost/Project-I/backend/addEnquiries.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form).toString(),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess('Thank you for your enquiry! We will get back to you soon.');
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(data.message || 'Failed to submit enquiry.');
      }
    } catch {
      setError('Failed to submit enquiry.');
    }
    setLoading(false);
  };

  return (
    <section id="contact" className="py-5 contact-section" style={{ background: '#ffffff' }}>
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .contact-section::-webkit-scrollbar { display: none; }
        .contact-section { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Center align button text in contact form */
        .contact-section .btn {
          text-align: center !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
    `}</style>
    <div className="container">
      <div className="text-center mb-5">
        <h2 className="display-4 fw-bold text-dark mb-3">Contact Us</h2>
        <p className="lead text-muted">Get in touch with us for your next adventure</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow">
            <div className="card-body p-5">
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Name</label>
                      <input type="text" className="form-control" placeholder="Your name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Email</label>
                      <input type="email" className="form-control" placeholder="Your email" name="email" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Message</label>
                    <textarea className="form-control" rows="5" placeholder="Your message" name="message" value={form.message} onChange={handleChange} required></textarea>
              </div>
                  <button className="btn btn-primary btn-lg w-100" type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
};

// Footer as a top-level component
function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleFooterHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollToTop: true } });
    } else {
      scrollToSection("home");
    }
  };
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        {/* Main Footer Content */}
        <div className="row g-4">
          {/* First Column - Logo and Brand */}
          <div className="col-lg-4 col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-3">
              <a href="#home" onClick={handleFooterHomeClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img 
                  src="/logo.png" 
                  alt="Serendip Waves Logo" 
                  width="70" 
                  height="70" 
                  className="me-3"
                />
                <h5 className="fw-bold mb-0" style={{ color: 'white', marginBottom: 0, cursor: 'pointer' }}>Serendip Waves</h5>
              </a>
            </div>
            <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
              Your journey to paradise starts here. We specialize in creating unforgettable cruise experiences that combine luxury, adventure, and discovery across the world's most beautiful destinations.
            </p>
          </div>
          {/* Second Column - Quick Links */}
          <div className="col-lg-4 col-md-6 text-center text-md-start">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ color: '#ffd600' }}>Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a 
                  href="#home" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-house me-2 text-white"></i>Home
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="#about" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-info-circle me-2 text-white"></i>About Us
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="#contact" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-envelope me-2 text-white"></i>Contact
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="#destinations" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-geo-alt me-2 text-white"></i>Destinations
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="/cruise-ships" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-ship me-2 text-white"></i>Cruises
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="/things-to-do" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-building me-2 text-white"></i>Facilities
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="/our-dining" 
                  className="text-decoration-none text-light"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffd600'}
                  onMouseLeave={(e) => e.target.style.color = '#f8f9fa'}
                >
                  <i className="bi bi-cup-hot me-2 text-white"></i>Our Dining
                </a>
              </li>
            </ul>
          </div>
          {/* Third Column - Contact Information */}
          <div className="col-lg-4 col-md-6 text-md-start">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ color: '#ffd600' }}>Contact Info</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="mailto:info@serendipwaves.com"
                  className="text-decoration-none text-light fw-semibold"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={e => e.target.style.color = '#ffd600'}
                  onMouseLeave={e => e.target.style.color = '#f8f9fa'}
                >
                  info@serendipwaves.com
                </a>
              </li>
              <li className="mb-2 text-light fw-semibold">
                <a
                  href="tel:+94771234567"
                  className="text-decoration-none text-light fw-semibold"
                  style={{ transition: 'color 0.3s ease' }}
                  onMouseEnter={e => e.target.style.color = '#ffd600'}
                  onMouseLeave={e => e.target.style.color = '#f8f9fa'}
                >
                  +94 77 123 4567
                </a>
              </li>
              <li className="mb-2 text-light fw-semibold">
                Colombo, Sri Lanka
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Section - Copyright and Social Media */}
        <div className="border-top border-secondary pt-4 mt-4">
          <div className="row align-items-center">
            {/* Copyright */}
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="text-light mb-0">
                © 2025 Serendip Waves. All rights reserved.
              </p>
            </div>
            {/* Social Media Icons */}
            <div className="col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                  style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <i className="bi bi-facebook fs-5 text-white"></i>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                  style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <i className="bi bi-instagram fs-5 text-white"></i>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                  style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <i className="bi bi-youtube fs-5 text-white"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Destination Gallery Section
const DestinationGallerySection = () => {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get('http://localhost/Project-I/backend/getItineraries.php');
        if (response.data) {
          // Take up to 9 destinations for perfect grid layout
          setDestinations(response.data.slice(0, 9));
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <section id="destination-gallery" style={{
      padding: '5rem 0',
      background: '#f8f9fa',
    }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="gallery-title">TAKE ADVENTURE TO NEW HEIGHTS</h2>
          <p className="gallery-description">
            Everyone deserves a vacation. You'll find endless opportunities to make the most of every moment — 
            like game changing activities, world-class dining, show-stopping entertainment, and plenty of ways 
            to unwind in the sun.
          </p>
        </div>

        <div className="destination-gallery-grid">
          {destinations.map((dest, idx) => (
            <Link
              key={idx}
              to={`/destination/${dest.route ? dest.route.toLowerCase() : ''}`}
              state={{ destination: dest }}
              className="gallery-item"
              style={{ textDecoration: 'none' }}
            >
              <img
                src={dest.country_image ? `http://localhost/Project-I/backend/${dest.country_image}` : '/assets/default.jpg'}
                alt={dest.route}
                className="gallery-image"
              />
              <div className="gallery-overlay">
                <h3 className="gallery-country-name">{dest.route}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .gallery-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a237e;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }
        .gallery-description {
          font-size: 1.05rem;
          color: #475569;
          max-width: 900px;
          margin: 0 auto;
          line-height: 1.8;
        }
        .destination-gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 280px);
          gap: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .gallery-item-large {
          grid-row: span 2;
        }
        .gallery-item:nth-child(1) {
          grid-column: span 1;
        }
        .gallery-item:nth-child(2) {
          grid-column: span 1;
        }
        .gallery-item:nth-child(3) {
          grid-column: span 2;
          grid-row: span 2;
        }
        .gallery-item:nth-child(4) {
          grid-column: span 1;
        }
        .gallery-item:nth-child(5) {
          grid-column: span 1;
        }
        .gallery-item:nth-child(6) {
          grid-column: span 1;
        }
        .gallery-item:nth-child(7) {
          grid-column: span 1;
        }
        .gallery-item:nth-child(8) {
          grid-column: span 2;
          grid-row: span 2;
        }
        .gallery-item:nth-child(9) {
          grid-column: span 2;
        }
        .gallery-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .gallery-item:hover .gallery-image {
          transform: scale(1.08);
        }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .gallery-country-name {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          text-align: center;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
          text-shadow: 0 3px 15px rgba(0,0,0,0.6);
        }
        @media (max-width: 991.98px) {
          .destination-gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .gallery-item {
            height: 220px;
          }
          .gallery-title {
            font-size: 2rem;
          }
        }
        @media (max-width: 767.98px) {
          .destination-gallery-grid {
            grid-template-columns: 1fr;
          }
          .gallery-item {
            height: 250px;
          }
          .gallery-item-large {
            grid-row: span 1;
          }
          .gallery-country-name {
            font-size: 1.5rem;
          }
          .gallery-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </section>
  );
};

// After Destinations section, before About section
const FleetSection = () => {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await axios.get('http://localhost/Project-I/backend/getShipDetails.php');
        if (response.data) {
          setShips(response.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching ships:', error);
      }
    };
    fetchShips();
  }, []);

  return (
    <section id="fleet" style={{
      background: 'linear-gradient(135deg, #0a1929 0%, #1a2332 100%)',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '5rem 0',
    }}>
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3rem', marginBottom: '4rem' }}>
          {/* Left: Heading */}
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <h1 style={{ 
              color: '#ffffff', 
              fontWeight: 800, 
              fontSize: '3.5rem', 
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              marginBottom: '1.5rem'
            }}>
              NEWEST.<br/>
              BOLDEST.<br/>
              BEST.
            </h1>
            <p style={{ 
              color: '#b0bec5', 
              fontSize: '1.1rem', 
              lineHeight: 1.7,
              fontWeight: 400
            }}>
              There are so many ways to conquer your bucket list while we await the arrival of the next Icon Class ship, Legend of the Seas™. From the game changing Oasis Class to the Icon of Vacations℠, explore our newest, best ships.
            </p>
          </div>
          {/* Right: Ship Cards */}
          <div style={{ flex: 1.5, display: 'flex', gap: '1.5rem', justifyContent: 'flex-end' }}>
            {ships.map((ship, idx) => (
              <Link
                key={idx}
                to="/cruise-ships"
                style={{ textDecoration: 'none', flex: 1, maxWidth: '280px' }}
              >
                <div className="fleet-card" style={{
                  background: '#1e293b',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  height: '420px'
                }}>
                  <div style={{ 
                    height: '280px', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={`http://localhost/Project-I/backend/${ship.ship_image}`}
                      alt={ship.ship_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      className="fleet-card-img"
                    />
                  </div>
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ 
                      color: '#ffffff', 
                      fontSize: '1.4rem', 
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      {ship.ship_name}
                    </h3>
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      margin: 0
                    }}>
                      {ship.class}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* View All Ships Button */}
        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/cruise-ships" 
            className="btn btn-lg"
            style={{
              background: '#ffffff',
              color: '#0a1929',
              border: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              padding: '1rem 3rem',
              borderRadius: '12px',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(255,255,255,0.2)'
            }}
          >
            View All Ships
          </Link>
        </div>
      </div>
      <style>{`
        .fleet-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        }
        .fleet-card:hover .fleet-card-img {
          transform: scale(1.1);
        }
        #fleet .btn:hover {
          background: #f0f0f0 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255,255,255,0.3);
        }
        @media (max-width: 991.98px) {
          #fleet .container > div:first-child {
            flex-direction: column !important;
            align-items: center !important;
          }
          #fleet .container > div:first-child > div:last-child {
            flex-direction: column !important;
            width: 100%;
          }
          .fleet-card {
            max-width: 100% !important;
          }
        }
        @media (max-width: 767.98px) {
          #fleet h1 {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
};

const DestinationsSection = () => {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState("any");
  const [selectedShip, setSelectedShip] = useState("any");
  const [selectedMonth, setSelectedMonth] = useState("any");

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await axios.get("http://localhost/Project-I/backend/getItineraries.php");
        setDestinations(res.data || []);
        setFilteredDestinations(res.data || []);
      } catch (error) {
        console.error("Failed to fetch itineraries for home slider:", error);
        setDestinations([]);
        setFilteredDestinations([]);
      }
    };
    fetchItineraries();
  }, []);

  // Auto-filter when dropdown selections change
  useEffect(() => {
    const filtered = destinations.filter(dest => {
      const matchesDestination = selectedDestination === "any"
        ? true
        : (dest.route && dest.route.toLowerCase() === selectedDestination.toLowerCase());

      const matchesShip = selectedShip === "any"
        ? true
        : (dest.ship_name && dest.ship_name.toLowerCase() === selectedShip.toLowerCase());

      const matchesMonth = selectedMonth === "any"
        ? true
        : (dest.start_date && new Date(dest.start_date).getMonth() === parseInt(selectedMonth, 10));

      return matchesDestination && matchesShip && matchesMonth;
    });
    
    setFilteredDestinations(filtered);
    setCurrentIndex(0);
  }, [selectedDestination, selectedShip, selectedMonth, destinations]);

  // Auto-slideshow effect - only when no filters applied
  useEffect(() => {
    if (filteredDestinations.length === 0) return;
    const isFiltered = selectedDestination !== "any" || selectedShip !== "any" || selectedMonth !== "any";
    if (isFiltered) return; // Don't auto-slide when filters are active
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredDestinations.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [filteredDestinations.length, selectedDestination, selectedShip, selectedMonth]);

  const handleSearch = () => {
    const filtered = destinations.filter(dest => {
      const matchesDestination = selectedDestination === "any"
        ? true
        : (dest.route && dest.route.toLowerCase() === selectedDestination.toLowerCase());

      const matchesShip = selectedShip === "any"
        ? true
        : (dest.ship_name && dest.ship_name.toLowerCase() === selectedShip.toLowerCase());

      const matchesMonth = selectedMonth === "any"
        ? true
        : (dest.start_date && new Date(dest.start_date).getMonth() === parseInt(selectedMonth, 10));

      return matchesDestination && matchesShip && matchesMonth;
    });
    
    setFilteredDestinations(filtered);
    setCurrentIndex(0);
  };

  const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handlePrev = () => {
    if (filteredDestinations.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + filteredDestinations.length) % filteredDestinations.length);
  };

  const handleNext = () => {
    if (filteredDestinations.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % filteredDestinations.length);
  };

  const visibleCards = () => {
    const maxVisible = 4;
    if (filteredDestinations.length === 0) return [];
    if (filteredDestinations.length <= maxVisible) return filteredDestinations;
    const cards = [];
    for (let i = 0; i < maxVisible; i++) {
      cards.push(filteredDestinations[(currentIndex + i) % filteredDestinations.length]);
    }
    return cards;
  };

  return (
    <section id="destinations-section" style={{
      background: 'linear-gradient(135deg, #e9eff7 0%, #dbe6f6 100%)',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'visible',
      color: '#1a237e',
      padding: '3rem 0',
      margin: '0',
    }}>
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-3" style={{ color: '#1a237e', fontWeight: 800, fontSize: '2.4rem', letterSpacing: '0.04em' }}>
            Explore Destinations
          </h1>
          <p className="mb-0" style={{ color: '#26334d', fontSize: '1.05rem', maxWidth: 620, margin: '0 auto' }}>
            A glimpse of our most loved routes. Swipe through and discover where your next escape could be.
          </p>
        </div>

        {/* Search / Filter bar */}
        <div className="home-cruise-filter-bar mb-5">
          <div className="home-cruise-filter-inner">
            <div className="home-cruise-filter-group">
              <label className="home-cruise-filter-label">Destination</label>
              <select
                className="home-cruise-filter-select"
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
              >
                <option value="any">Anywhere</option>
                {Array.from(new Set(destinations.map(d => d.route).filter(Boolean))).map((route, idx) => (
                  <option key={idx} value={route}>{route}</option>
                ))}
              </select>
            </div>
            <div className="home-cruise-filter-group">
              <label className="home-cruise-filter-label">Cruise ship</label>
              <select
                className="home-cruise-filter-select"
                value={selectedShip}
                onChange={e => setSelectedShip(e.target.value)}
              >
                <option value="any">Any ship</option>
                {Array.from(new Set(destinations.map(d => d.ship_name).filter(Boolean))).map((ship, idx) => (
                  <option key={idx} value={ship}>{ship}</option>
                ))}
              </select>
            </div>
            <div className="home-cruise-filter-group">
              <label className="home-cruise-filter-label">Month</label>
              <select
                className="home-cruise-filter-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                <option value="any">Any month</option>
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => (
                  <option key={m} value={m}>{new Date(2025, m, 1).toLocaleString('en-US', { month: 'long' })}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* No Results Message */}
        {filteredDestinations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: '#64748b',
            fontSize: '1.1rem'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              opacity: 0.5
            }}>🔍</div>
            <h3 style={{ color: '#334155', marginBottom: '0.5rem' }}>No cruises found</h3>
            <p>Try adjusting your filters to see more results</p>
          </div>
        )}

        {filteredDestinations.length > 0 && (
        <div className="position-relative" style={{ padding: '0 70px', overflow: 'visible' }}>
          {/* Left arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="home-dest-arrow left"
            aria-label="Previous destinations"
          >
            ‹
          </button>

          {/* Slider viewport */}
          <div className="home-dest-slider-viewport" style={{ overflow: 'visible' }}>
            <div className="home-dest-slider-row" data-count={visibleCards().length}>
              {visibleCards().map((dest, idx) => {
                const calculatedNights = calculateNights(dest.start_date, dest.end_date);
                const startingPriceRaw = dest.starting_price ?? dest.price;
                const startingPrice = startingPriceRaw && !isNaN(startingPriceRaw)
                  ? Number(startingPriceRaw)
                  : null;
                return (
                  <Link
                    key={idx}
                    to={`/destination/${dest.route ? dest.route.toLowerCase() : ''}`}
                    state={{ destination: dest }}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="destination-card destination-card-tall home-dest-card-fixed">
                      <img
                        className="destination-image destination-image-cover"
                        src={dest.country_image ? `http://localhost/Project-I/backend/${dest.country_image}` : '/assets/default.jpg'}
                        alt={dest.route}
                      />
                      <div className="destination-overlay destination-overlay-bottom">
                        {calculatedNights && (
                          <div className="destination-nights">
                            {calculatedNights} NIGHT{calculatedNights > 1 ? 'S' : ''}
                          </div>
                        )}
                        <div className="destination-title-large">{dest.route}</div>
                        {startingPrice !== null && (
                          <div className="destination-price-label">STARTING FROM</div>
                        )}
                        {startingPrice !== null && (
                          <div className="destination-price">${startingPrice.toLocaleString()}</div>
                        )}
                        <button
                          type="button"
                          className="destination-explore-btn"
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="home-dest-arrow right"
            aria-label="Next destinations"
          >
            ›
          </button>
        </div>
        )}

        {/* View All Destinations button below cards */}
        <div className="text-center mt-5">
          <Link to="/destinations" className="btn view-all-destinations-btn" style={{ fontSize: '1rem', padding: '0.6rem 2rem', display: 'inline-block', width: 'auto' }}>
            View All Destinations
          </Link>
        </div>
      </div>

      <style>{`
        /* Filter bar for home page destinations */
        .home-cruise-filter-bar {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 15px;
        }
        .home-cruise-filter-inner {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border-radius: 18px;
          padding: 28px 32px;
          display: flex;
          align-items: flex-end;
          gap: 20px;
          box-shadow: 0 10px 35px rgba(30,58,138,0.3);
        }
        .home-cruise-filter-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .home-cruise-filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .home-cruise-filter-select {
          background: #ffffff;
          border: 2px solid transparent;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 1rem;
          color: #1e293b;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .home-cruise-filter-select:hover {
          border-color: #fbbf24;
        }
        .home-cruise-filter-select:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251,191,36,0.2);
        }
        .home-cruise-filter-btn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #1e293b;
          border: none;
          border-radius: 10px;
          padding: 14px 32px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(251,191,36,0.4);
          white-space: nowrap;
        }
        .home-cruise-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(251,191,36,0.5);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .home-cruise-filter-btn:active {
          transform: translateY(0);
        }
        @media (max-width: 991.98px) {
          .home-cruise-filter-inner {
            flex-wrap: wrap;
            gap: 16px;
          }
          .home-cruise-filter-group {
            flex: 1 1 calc(50% - 8px);
            min-width: 150px;
          }
          .home-cruise-filter-btn {
            width: 100%;
          }
        }
        @media (max-width: 767.98px) {
          .home-cruise-filter-group {
            flex: 1 1 100%;
          }
        }

        .home-dest-slider-viewport {
          overflow: visible;
          width: 100%;
        }
        .home-dest-slider-row {
          display: flex;
          gap: 18px;
          width: 100%;
          justify-content: center;
        }
        /* Dynamic card layout based on count */
        .home-dest-slider-row[data-count="1"] {
          justify-content: center;
        }
        .home-dest-slider-row[data-count="1"] .home-dest-card-fixed {
          width: calc(100% - 40px);
          max-width: 900px;
          height: 600px;
        }
        .home-dest-slider-row[data-count="2"] {
          justify-content: center;
          gap: 30px;
        }
        .home-dest-slider-row[data-count="2"] .home-dest-card-fixed {
          width: 340px;
          height: 510px;
        }
        .home-dest-slider-row[data-count="3"] {
          justify-content: center;
          gap: 24px;
        }
        .home-dest-slider-row[data-count="3"] .home-dest-card-fixed {
          width: 300px;
          height: 490px;
        }
        @keyframes fadeSlide {
          0% { opacity: 0.4; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .home-dest-card-fixed {
          animation: fadeSlide 0.8s ease-out;
        }
        .home-dest-card-fixed {
          width: 280px;
          height: 480px;
          flex: 0 0 auto;
          opacity: 1;
          transition: opacity 0.5s ease-in-out;
        }
        @media (min-width: 1200px) {
          .home-dest-card-fixed {
            width: 280px;
          }
        }
        @media (max-width: 991.98px) {
          .home-dest-card-fixed {
            width: 240px;
            height: 420px;
          }
        }
        @media (max-width: 767.98px) {
          .home-dest-card-fixed {
            width: 80vw;
            max-width: 320px;
          }
          .home-dest-slider-row {
            justify-content: center;
          }
        }
        .home-dest-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 480px;
          border-radius: 4px;
          border: none;
          background: rgba(37, 99, 235, 0.75);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 2.2rem;
          font-weight: 100;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37,99,235,0.3);
          z-index: 10;
          transition: all 0.3s cubic-bezier(0, 0, 0, 0.2);
          outline: none;
          opacity: 0.7;
        }
        .home-dest-arrow.left { 
          left: -45px;
          animation: slideInLeft 0.5s ease-out;
        }
        .home-dest-arrow.right { 
          right: -45px;
          animation: slideInRight 0.5s ease-out;
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateY(-50%) translateX(-20px); }
          to { opacity: 0.9; transform: translateY(-50%) translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateY(-50%) translateX(20px); }
          to { opacity: 0.9; transform: translateY(-50%) translateX(0); }
        }
        .home-dest-arrow:hover {
          box-shadow: 0 6px 28px rgba(37,99,235,0.5);
          background: rgba(29, 78, 216, 0.95);
          opacity: 1;
        }
        .home-dest-arrow:active {
          transform: translateY(-50%) scale(0.98);
        }
        .home-dest-arrow:focus {
          outline: none;
          box-shadow: 0 12px 32px rgba(37,99,235,0.6);
        }
        @media (max-width: 991.98px) {
          #destinations-section .position-relative {
            padding: 0 60px !important;
          }
        }
        @media (max-width: 767.98px) {
          #destinations-section .position-relative {
            padding: 0 50px !important;
          }
          .home-dest-arrow { width: 28px; height: 380px; font-size: 1.4rem; }
        }

        /* Shared destination card styles */
        .destination-card {
          background: #111827;
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 18px 45px rgba(15,23,42,0.45);
          transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
          cursor: pointer;
          will-change: transform;
        }
        .destination-card-tall {
          height: 480px;
        }
        .destination-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 70px rgba(15,23,42,0.7);
        }
        .destination-image-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.85);
          transition: transform 0.22s ease-out, filter 0.22s ease-out;
        }
        .destination-card:hover .destination-image-cover {
          transform: scale(1.04);
          filter: brightness(0.95);
        }
        .destination-overlay-bottom {
          position: absolute;
          inset: auto 0 0 0;
          padding: 30px 22px 28px 22px;
          background: linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.9) 35%, rgba(15,23,42,1) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }
        .destination-nights {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(243,244,246,0.85);
        }
        .destination-title-large {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f9fafb;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 2px 0;
        }
        .destination-price-label {
          margin-top: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(209,213,219,0.85);
        }
        .destination-price {
          font-size: 1.6rem;
          font-weight: 900;
          color: #f9fafb;
          margin: 2px 0;
        }
        .destination-explore-btn {
          margin-top: 14px;
          align-self: stretch;
          border-radius: 999px;
          border: none;
          background: #fbbf24;
          color: #111827;
          font-weight: 800;
          font-size: 0.98rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 0;
          box-shadow: 0 12px 30px rgba(251,191,36,0.45);
          cursor: pointer;
          transition: transform 0.14s ease-out, box-shadow 0.14s ease-out, background 0.14s ease-out;
        }
        .destination-explore-btn:hover {
          background: #f59e0b;
          transform: translateY(-1px);
          box-shadow: 0 18px 40px rgba(245,158,11,0.55);
        }
        .destination-explore-btn:active {
          transform: translateY(0) scale(0.99);
          box-shadow: 0 10px 24px rgba(208,138,4,0.55);
        }
      `}</style>
    </section>
  );
};

// Facilities Section (after Destinations)
const FacilitiesSection = () => {
  const facilities = [
    {
      icon: '💆',
      title: 'Spa & Wellness',
      description: 'Rejuvenate your body and mind with our world-class spa treatments, massage therapy, and wellness programs.'
    },
    {
      icon: '🍽️',
      title: 'Fine Dining',
      description: 'Experience gourmet cuisine from around the world prepared by master chefs in elegant dining settings.'
    },
    {
      icon: '🎭',
      title: 'Entertainment',
      description: 'Enjoy Broadway-style shows, live music, casino gaming, and exclusive nightlife entertainment.'
    }
  ];

  return (
    <section id="facilities-section" style={{
      background: 'linear-gradient(135deg, #dce4f0 0%, #cdd9ed 100%)',
      padding: '5rem 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-3" style={{ 
            color: '#1a237e', 
            fontWeight: 800, 
            fontSize: '2.4rem', 
            letterSpacing: '0.04em' 
          }}>
            Luxury Facilities
          </h1>
          <p className="mb-0" style={{ 
            color: '#26334d', 
            fontSize: '1.05rem', 
            maxWidth: 620, 
            margin: '0 auto' 
          }}>
            Indulge in world-class amenities designed for your ultimate comfort and relaxation.
          </p>
        </div>

        <div className="facilities-cards-row">
          {facilities.map((facility, idx) => (
            <div key={idx} className="facility-card">
              <div className="facility-icon">{facility.icon}</div>
              <h3 className="facility-title">{facility.title}</h3>
              <p className="facility-description">{facility.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link to="/things-to-do" className="btn explore-more-btn">
            Explore More
          </Link>
        </div>
      </div>

      <style>{`
        .facilities-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .facility-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          box-shadow: 0 8px 24px rgba(26,35,126,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .facility-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(26,35,126,0.15);
        }
        .facility-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          filter: grayscale(0);
        }
        .facility-title {
          color: #1a237e;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .facility-description {
          color: #475569;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
        }
        .explore-more-btn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #1e293b;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.75rem 2.5rem;
          border-radius: 50px;
          border: none;
          box-shadow: 0 6px 20px rgba(251,191,36,0.4);
          transition: all 0.3s ease;
          display: inline-block;
          width: auto;
        }
        .explore-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(251,191,36,0.5);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #1e293b;
        }
        @media (max-width: 991.98px) {
          .facilities-cards-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .facility-card {
            padding: 2rem 1.5rem;
          }
        }
        @media (max-width: 767.98px) {
          #facilities-section {
            padding: 3rem 0;
          }
          .facility-icon {
            font-size: 3rem;
          }
          .facility-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </section>
  );
};

// Our Dining Section (after Facilities)
const DiningSection = () => {
  const [mealOptions, setMealOptions] = useState([]);

  useEffect(() => {
    const fetchMealOptions = async () => {
      try {
        const response = await axios.get('http://localhost/Project-I/backend/mealOptionsAPI.php');
        if (response.data.success && response.data.data) {
          // Filter active options and exclude 'asian' type
          const activeOptions = response.data.data.filter(option => 
            option.status === 'active' && 
            option.type?.toLowerCase() !== 'asian'
          );
          setMealOptions(activeOptions.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching meal options:', error);
      }
    };
    fetchMealOptions();
  }, []);

  return (
    <section id="dining-section" style={{
      minHeight: 'auto',
      padding: '5rem 0',
      background: '#ffffff',
    }}>
      <div className="container">
        <div className="row">
          {/* Left: Text Content */}
          <div className="col-lg-5 d-flex flex-column justify-content-center mb-4 mb-lg-0">
            <h2 className="dining-section-title">SPECIALTY DINING OPTIONS</h2>
            <p className="dining-section-description">
              Experience exceptional culinary offerings tailored to every dietary preference and lifestyle. 
              From vegetarian delights to halal gourmet cuisine, our specialty dining options ensure every 
              passenger enjoys world-class meals prepared with care. Whether you require gluten-free, 
              diabetic-friendly, or vegan options, our expert chefs craft delicious meals that never 
              compromise on taste or quality.
            </p>
          </div>

          {/* Right: Meal Options Grid */}
          <div className="col-lg-7">
            <div className="restaurants-grid">
              {mealOptions.map((option, idx) => (
                <div key={idx} className="restaurant-card">
                  <img
                    src={option.image ? `http://localhost/Project-I/backend/meal_images/${option.image}` : '/assets/default-meal.jpg'}
                    alt={option.type}
                    className="restaurant-image"
                  />
                  <div className="restaurant-overlay">
                    <h3 className="restaurant-name">{option.type}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-5">
          <Link to="/our-dining" className="btn view-all-dining-btn">
            View All Dining Options
          </Link>
        </div>
      </div>

      <style>{`
        .dining-section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a237e;
          margin-bottom: 1.5rem;
          letter-spacing: 0.02em;
        }
        .dining-section-description {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #475569;
        }
        .restaurants-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 1rem;
          height: 100%;
          max-height: 480px;
        }
        .restaurant-card {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 235px;
        }
        .restaurant-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .restaurant-card:first-child {
          grid-row: span 1;
        }
        .restaurant-card:nth-child(2) {
          grid-row: span 1;
        }
        .restaurant-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .restaurant-card:hover .restaurant-image {
          transform: scale(1.05);
        }
        .restaurant-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 1.5rem;
        }
        .restaurant-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ffffff;
          text-align: center;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        @media (max-width: 991.98px) {
          .restaurants-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            min-height: auto;
          }
          .restaurant-card:first-child,
          .restaurant-card:nth-child(2) {
            grid-row: span 1;
          }
          .restaurant-card {
            height: 250px;
          }
          .dining-section-title {
            font-size: 2rem;
          }
        }
        @media (max-width: 767.98px) {
          .dining-section-title {
            font-size: 1.75rem;
          }
          .restaurant-name {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
};

const HomePage = ({ onBookingClick }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const [bookingError, setBookingError] = useState("");

  const handleBookingClick = () => {
    const role = currentUser?.role?.toLowerCase();
    if (!isAuthenticated || role !== "customer") {
      setBookingError("Please Login to the Website");
      setTimeout(() => setBookingError(""), 3000);
      return;
    }
    setBookingError("");
    onBookingClick();
  };

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <Hero onBookingClick={handleBookingClick} bookingError={bookingError} />
      <DestinationsSection />
      <FacilitiesSection />
      <DiningSection />
      <DestinationGallerySection />
      <FleetSection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <style>{`
        body, html, #root {
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          min-width: 100vw !important;
          width: 100% !important;
          height: 100% !important;
          overflow-x: hidden !important;
          background: transparent !important;
        }
        * {
          box-sizing: border-box;
        }
        .hero-section {
          min-height: 100vh !important;
          width: 100vw !important;
          min-width: 100vw !important;
          padding: 0 !important;
          margin: 0 !important;
          background-size: cover !important;
          background-position: center center !important;
          background-repeat: no-repeat !important;
          position: relative !important;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -80px !important;
          padding-top: 80px !important;
          height: calc(100vh + 80px) !important;
          min-height: calc(100vh + 80px) !important;
          overflow: hidden !important;
        }
        .hero-content {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          alignItems: center;
          justifyContent: center;
          padding: 0 20px;
        }
        .hero-cta-btn {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border: none;
          font-weight: 700;
          border-radius: 50px;
          font-size: 1.25rem;
          letter-spacing: 0.5px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hero-cta-btn:hover, .hero-cta-btn:focus {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(37,99,235,0.5);
        }
        .destination-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .destination-card:hover {
          transform: translateY(-10px);
        }
        .destination-card:hover .card {
          box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
        }
        .card {
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: scale(1.02);
        }
        .flag-icon {
          transition: transform 0.3s ease;
        }
        .destination-card:hover .flag-icon {
          transform: scale(1.1);
        }
        @media (max-width: 767.98px) {
          .hero-content h1 {
            font-size: 2.2rem;
          }
          .hero-content p {
            font-size: 1rem;
          }
        }
        @media (max-width: 575.98px) {
          .hero-content h1 {
            font-size: 1.8rem;
          }
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          scroll-behavior: smooth;
        }
        .view-all-ships-btn {
          background: #102347;
          color: #fff;
          border: none;
          font-weight: 700;
          letter-spacing: 0.03em;
          box-shadow: 0 4px 18px rgba(16,35,71,0.12);
          transition: all 0.3s ease;
        }
        .view-all-ships-btn:hover, .view-all-ships-btn:focus {
          background: #1a237e;
          color: #fff;
          box-shadow: 0 8px 28px rgba(16,35,71,0.35);
          transform: translateY(-2px);
        }
        .view-all-destinations-btn {
          background: #185a9d;
          color: #fff;
          border: none;
          font-weight: 700;
          letter-spacing: 0.03em;
          box-shadow: 0 4px 18px rgba(24,90,157,0.12);
          transition: all 0.3s ease;
        }
        .view-all-destinations-btn:hover, .view-all-destinations-btn:focus {
          background: #43cea2;
          color: #fff;
          box-shadow: 0 8px 28px rgba(67,206,162,0.35);
          transform: translateY(-2px);
        }
        .view-all-facilities-btn {
          background: #6c5ce7;
          color: #fff;
          border: none;
          font-weight: 700;
          letter-spacing: 0.03em;
          box-shadow: 0 4px 18px rgba(108,92,231,0.12);
          transition: all 0.3s ease;
        }
        .view-all-facilities-btn:hover, .view-all-facilities-btn:focus {
          background: #5b4cdb;
          color: #fff;
          box-shadow: 0 8px 28px rgba(108,92,231,0.35);
          transform: translateY(-2px);
        }
        .view-all-dining-btn {
          background: #fd79a8;
          color: #fff;
          border: none;
          font-weight: 700;
          letter-spacing: 0.03em;
          box-shadow: 0 4px 18px rgba(253,121,168,0.12);
          transition: all 0.3s ease;
          display: inline-block;
          width: auto;
        }
        .view-all-dining-btn:hover, .view-all-dining-btn:focus {
          background: #fd6c9e;
          color: #fff;
          box-shadow: 0 8px 28px rgba(253,121,168,0.35);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default HomePage;