import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import BookingModal from "./BookingModal";
import { Modal, Button } from 'react-bootstrap';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout, setIsBookingModalOpen, isBookingModalOpen, defaultBookingCountry } = useContext(AuthContext);
  const [localBookingModalOpen, setLocalBookingModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Debug: Log context values on every render
  console.log("Navbar render: isAuthenticated =", isAuthenticated, "currentUser =", currentUser);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
      if (window.innerWidth >= 992) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const _handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const _handleSignupClick = () => {
    console.log('handleSignupClick called');
    setIsMenuOpen(false);
    if (onSignupClick) {
      console.log('onSignupClick prop exists, calling it');
      onSignupClick();
    } else {
      console.log('onSignupClick prop is missing');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  return (
    <>
      <style>{`
        .navbar {
          padding: 8px 0 !important;
        }
        .navbar .btn-login {
          transition: all 0.2s;
        }
        .navbar .btn-login:hover {
          background: #ffd600 !important;
          border-color: #ffd600 !important;
          color: #222 !important;
        }
        .navbar .nav-link, .navbar-nav .nav-link {
          transition: background 0.2s, color 0.2s;
          border-radius: 10px;
          margin: 0 4px;
        }
        .navbar .nav-link:hover, .navbar-nav .nav-link:hover {
          background: #e0e7ff !important;
          color: #1a237e !important;
        }
        .hamburger-menu {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 25px;
          height: 25px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }
        .hamburger-menu span {
          width: 25px;
          height: 3px;
          background: #1a237e;
          border-radius: 10px;
          transition: all 0.3s linear;
          position: relative;
          transform-origin: 1px;
        }
        .hamburger-menu.open span:first-child {
          transform: rotate(45deg);
        }
        .hamburger-menu.open span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-menu.open span:nth-child(3) {
          transform: rotate(-45deg);
        }
        @media (max-width: 991px) {
          .hamburger-menu {
            display: flex;
          }
        }
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(26, 35, 126, 0.35);
          backdrop-filter: blur(18px) saturate(180%);
          -webkit-backdrop-filter: blur(18px) saturate(180%);
          z-index: 9998;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          border-radius: 32px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          max-width: 90vw;
          max-height: 90vh;
          margin: 2vh auto;
        }
        .mobile-menu .close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.25);
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 50%;
          color: #1a237e;
          font-size: 1.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10000;
          transition: background 0.2s, color 0.2s;
        }
        .mobile-menu .close-btn:hover {
          background: #fff;
          color: #e53935;
        }
        .mobile-menu .nav-link {
          color: #fff !important;
          font-size: 1.2rem !important;
          padding: 1rem 0 !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          text-align: center;
          width: 100%;
        }
        .mobile-menu .nav-link:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #ffd600 !important;
        }
        .logo-text {
          font-size: clamp(1.2rem, 3vw, 2.1rem) !important;
          line-height: 1.1 !important;
        }
        .logo-image {
          width: clamp(50px, 12vw, 100px) !important;
          height: auto !important;
          max-height: 60px !important;
        }
        @media (max-width: 576px) {
          .logo-text {
            font-size: 1.1rem !important;
          }
          .logo-image {
            width: 45px !important;
          }
        }
      `}</style>
      <nav 
        className="navbar navbar-expand-lg position-fixed w-100 top-0 start-0 px-2"
        style={{ 
          zIndex: 9999, 
          background: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          padding: '8px 0',
          minHeight: '50px',
          maxHeight: '65px',
          borderBottom: '1px solid #eee'
        }}
      >
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
          {/* Logo and Brand */}
          <div className="d-flex align-items-center" style={{ padding: '0 4px' }}>
            <Link
              to="/"
              className="navbar-brand d-flex align-items-center fw-bold fs-5 me-4"
              style={{
                color: '#1a237e',
                fontFamily: 'Montserrat, Arial, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                flexShrink: 0
              }}
              onClick={e => handleNavClick(e, 'home')}
            >
              <img 
                src="/logo.png" 
                alt="Serendip Waves Logo" 
                className="logo-image me-2" 
                style={{ 
                  objectFit: 'contain', 
                  verticalAlign: 'middle' 
                }} 
              />
              <span className="logo-text" style={{ 
                fontWeight: 700, 
                letterSpacing: '0.04em', 
                color: '#1a237e', 
                whiteSpace: 'nowrap'
              }}>
                serendip<br/>waves
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isLargeScreen && (
            <div className="d-flex align-items-center gap-3" style={{ padding: '0 8px' }}>
              <div className="d-flex align-items-center gap-4">
                <a href="#home" className="nav-link fw-semibold" onClick={e => handleNavClick(e, 'home')} style={{ 
                  color: '#222', 
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>Home</a>
                               <Link to="/destinations" className="nav-link fw-semibold" style={{ 
                  color: '#222', 
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>Destination</Link>
                <Link to="/things-to-do" className="nav-link fw-semibold" style={{ 
                  color: '#222', 
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>Facilities</Link>
                <Link to="/our-dining" className="nav-link fw-semibold" style={{ 
                  color: '#222', 
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>Dining</Link>
                <Link to="/cruise-ships" className="nav-link fw-semibold" style={{ 
                  color: '#222',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>Cruises</Link>
                <a href="#about" className="nav-link fw-semibold" onClick={e => handleNavClick(e, 'about')} style={{ 
                  color: '#222',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>About</a>
                <a href="#contact" className="nav-link fw-semibold" onClick={e => handleNavClick(e, 'contact')} style={{ 
                  color: '#222',
                  fontSize: '1.05rem',
                  padding: '8px 20px',
                  fontWeight: 500
                }}>Contact</a>
                {isAuthenticated && (!currentUser?.role || currentUser?.role.toLowerCase() === 'customer') ? (
                  <div className="position-relative" ref={profileRef}>
                    <button
                      className="btn btn-outline-light"
                      type="button"
                      style={{ color: '#222', fontWeight: 700, borderRadius: '22px', padding: '10px 28px', fontSize: '1.05rem' }}
                      onClick={() => setProfileOpen((open) => !open)}
                    >
                      {currentUser?.full_name || currentUser?.name || currentUser?.email || 'Profile'}
                    </button>
                    {profileOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '110%',
                        minWidth: 240,
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: 12,
                        boxShadow: '0 2px 12px #0001',
                        zIndex: 2000,
                        padding: '18px 20px',
                      }}>
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: 10, paddingBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 2 }}>
                            {currentUser?.full_name || currentUser?.name || 'User'}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.97rem' }}>{currentUser?.email}</div>
                        </div>
                        <div style={{ borderTop: '1px solid #eee', marginTop: 10, paddingTop: 8 }}>
                          <Link to="/customer-dashboard" style={{ display: 'block', color: '#1a237e', fontWeight: 500, textDecoration: 'none', marginBottom: 8 }}>
                            Customer Dashboard
                          </Link>
                          <button
                            style={{ display: 'block', color: '#1a237e', fontWeight: 500, textDecoration: 'none', marginBottom: 8, background: 'none', border: 'none', width: '100%', textAlign: 'center', padding: 0, cursor: 'pointer' }}
                            onClick={() => {
                              if (setIsBookingModalOpen) {
                                setIsBookingModalOpen(true);
                              } else {
                                setLocalBookingModalOpen(true);
                              }
                              setProfileOpen(false);
                            }}
                          >
                            New Booking
                          </button>
                          <button className="dropdown-item" onClick={() => setShowLogoutModal(true)} style={{ padding: 0, color: '#e53935', background: 'none', border: 'none', width: '100%', textAlign: 'center', fontWeight: 500 }}>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleLoginClick}
                    className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 ms-2 btn-login"
                    style={{ 
                      borderRadius: '22px',
                      padding: '10px 28px',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      border: '1.5px solid #222',
                      background: '#fff',
                      color: '#222',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          {!isLargeScreen && (
            <button
              className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      {!isLargeScreen && isMenuOpen && (
        <div className="mobile-menu">
          <button className="close-btn" onClick={toggleMenu} aria-label="Close menu">&times;</button>
          <a href="#home" className="nav-link" onClick={e => { handleNavClick(e, 'home'); toggleMenu(); }}>Home</a>
          <Link to="/destinations" className="nav-link" onClick={() => setIsMenuOpen(false)}>Destination</Link>
          <Link to="/things-to-do" className="nav-link" onClick={() => setIsMenuOpen(false)}>Facilities</Link>
          <Link to="/our-dining" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dining</Link>
          <Link to="/cruise-ships" className="nav-link" onClick={() => setIsMenuOpen(false)}>Cruises</Link>
          <a href="#about" className="nav-link" onClick={e => { handleNavClick(e, 'about'); toggleMenu(); }}>About</a>
          <a href="#contact" className="nav-link" onClick={e => { handleNavClick(e, 'contact'); toggleMenu(); }}>Contact</a>
          {isAuthenticated && (!currentUser?.role || currentUser?.role.toLowerCase() === 'customer') ? (
            <>
              <Link to="/customer-dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Customer Dashboard</Link>
              <button
                className="nav-link"
                style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', width: '100%' }}
                onClick={() => {
                  if (setIsBookingModalOpen) {
                    setIsBookingModalOpen(true);
                  } else {
                    setLocalBookingModalOpen(true);
                  }
                  setIsMenuOpen(false);
                }}
              >
                New Booking
              </button>
              <button
                className="nav-link"
                style={{ background: 'none', border: 'none', color: '#e53935', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', width: '100%' }}
                onClick={() => {
                  setShowLogoutModal(true);
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="nav-link"
              style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', width: '100%' }}
            >
              Login
            </button>
          )}
        </div>
      )}
      {(isBookingModalOpen !== undefined ? isBookingModalOpen : localBookingModalOpen) && (
        <BookingModal
          isOpen={isBookingModalOpen !== undefined ? isBookingModalOpen : localBookingModalOpen}
          onClose={() => {
            if (setIsBookingModalOpen) {
              setIsBookingModalOpen(false);
            } else {
              setLocalBookingModalOpen(false);
            }
          }}
          defaultCountry={defaultBookingCountry}
        />
      )}
      {showLogoutModal && (
        <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Logout</Modal.Title>
          </Modal.Header>
          <Modal.Body>Do you want to logout?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>No</Button>
            <Button variant="danger" onClick={() => {
              logout();
              setShowLogoutModal(false);
              navigate('/login');
            }}>Yes, Logout</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
     
export default Navbar;                       