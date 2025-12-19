import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import destiImg from './assets/desti.webp';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("any");
  const [selectedShip, setSelectedShip] = useState("any");
  const [selectedMonth, setSelectedMonth] = useState("any");

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await axios.get("http://localhost/Project-I/backend/getItineraries.php");
        setDestinations(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Failed to fetch itineraries:", error);
      }
    };
    fetchItineraries();
  }, []);

  // Auto-filter when dropdown selections change
  useEffect(() => {
    const term = search.trim().toLowerCase();

    const filteredList = destinations.filter(dest => {
      const matchesText = !term
        ? true
        : ((dest.route && dest.route.toLowerCase().includes(term)) ||
           (dest.ship_name && dest.ship_name.toLowerCase().includes(term)));

      const matchesDestination = selectedDestination === "any"
        ? true
        : (dest.route && dest.route.toLowerCase() === selectedDestination.toLowerCase());

      const matchesShip = selectedShip === "any"
        ? true
        : (dest.ship_name && dest.ship_name.toLowerCase() === selectedShip.toLowerCase());

      const matchesMonth = selectedMonth === "any"
        ? true
        : (dest.start_date && new Date(dest.start_date).getMonth() === parseInt(selectedMonth, 10));

      return matchesText && matchesDestination && matchesShip && matchesMonth;
    });

    setFiltered(filteredList);
  }, [selectedDestination, selectedShip, selectedMonth, search, destinations]);

  const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSearch = () => {
    const term = search.trim().toLowerCase();

    const filteredList = destinations.filter(dest => {
      const matchesText = !term
        ? true
        : ((dest.route && dest.route.toLowerCase().includes(term)) ||
           (dest.ship_name && dest.ship_name.toLowerCase().includes(term)));

      const matchesDestination = selectedDestination === "any"
        ? true
        : (dest.route && dest.route.toLowerCase() === selectedDestination.toLowerCase());

      const matchesShip = selectedShip === "any"
        ? true
        : (dest.ship_name && dest.ship_name.toLowerCase() === selectedShip.toLowerCase());

      const matchesMonth = selectedMonth === "any"
        ? true
        : (dest.start_date && new Date(dest.start_date).getMonth() === parseInt(selectedMonth, 10));

      return matchesText && matchesDestination && matchesShip && matchesMonth;
    });

    setFiltered(filteredList);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f6fd' }}>
      <section
        id="destinations"
        style={{
          padding: "3rem 0 3rem 0",
          minHeight: "100vh",
          width: "100%",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '110px',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        
        <h2 className="text-center mb-2 fw-bold" style={{ 
          fontSize: "clamp(2rem, 4vw, 2.6rem)",
          marginBottom: '1.25rem',
          color: '#111827'
        }}>
          Find your perfect cruise
        </h2>
        <p className="lead text-muted text-center mb-4" style={{ 
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)", 
          maxWidth: 640, 
          margin: "0 auto 2.25rem auto",
          padding: '0 1rem'
        }}>
          Filter by destination, ship, or month and explore stunning routes around the world.
        </p>

        {/* Search / Filter bar */}
        <div className="featured-search-card cruise-filter-bar">
          <div className="cruise-filter-inner">
            <div className="cruise-filter-group">
              <label className="cruise-filter-label">Destination</label>
              <select
                className="cruise-filter-select"
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
              >
                <option value="any">Anywhere</option>
                {Array.from(new Set(destinations.map(d => d.route).filter(Boolean))).map((route, idx) => (
                  <option key={idx} value={route}>{route}</option>
                ))}
              </select>
            </div>
            <div className="cruise-filter-group">
              <label className="cruise-filter-label">Cruise ship</label>
              <select
                className="cruise-filter-select"
                value={selectedShip}
                onChange={e => setSelectedShip(e.target.value)}
              >
                <option value="any">Any ship</option>
                {Array.from(new Set(destinations.map(d => d.ship_name).filter(Boolean))).map((ship, idx) => (
                  <option key={idx} value={ship}>{ship}</option>
                ))}
              </select>
            </div>
            <div className="cruise-filter-group">
              <label className="cruise-filter-label">Month</label>
              <select
                className="cruise-filter-select"
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
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
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

        {/* Featured Destinations Row */}
        <div className="destinations-card-row">
          {filtered.map((dest, idx) => {
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
                <div className="destination-card destination-card-tall">
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
      </section>
      {/* SVG Wave for Nautical Theme */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, marginTop: '-2.5rem' }}>
        <svg viewBox="0 0 1440 120" width="100%" height="80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,32 C360,120 1080,0 1440,96 L1440,120 L0,120 Z" fill="#185a9d" fillOpacity="0.18" />
          <path d="M0,64 C480,0 960,160 1440,64 L1440,120 L0,120 Z" fill="#43cea2" fillOpacity="0.22" />
        </svg>
      </div>
      <style>{`
        #destinations {
          position: relative;
          min-height: 60vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 110px;
          padding-bottom: 3rem;
          background: transparent;
        }
        @media (min-width: 900px) {
          #destinations {
            min-height: 70vh;
          }
        }
        .cruise-filter-bar {
          background: #fefefe;
          border-radius: 28px;
          box-shadow: 0 18px 45px rgba(15,23,42,0.12);
          padding: 18px 22px;
          max-width: 1050px;
          margin: 0 auto 2.5rem auto;
        }
        .cruise-filter-inner {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          align-items: center;
        }
        .cruise-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cruise-filter-label {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
        }
        .cruise-filter-select {
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          padding: 10px 16px;
          font-size: 0.98rem;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
        }
        .cruise-filter-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.25);
          background: #ffffff;
        }
        .cruise-filter-btn {
          align-self: stretch;
          border-radius: 999px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #0f172a 100%);
          border: none;
          color: #f9fafb;
          font-weight: 700;
          font-size: 0.98rem;
          padding: 12px 20px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(37,99,235,0.35);
          transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
          white-space: nowrap;
        }
        .cruise-filter-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 40px rgba(37,99,235,0.45);
        }
        .cruise-filter-btn:active {
          transform: translateY(0px) scale(0.99);
          box-shadow: 0 8px 22px rgba(30,64,175,0.4);
        }
        @media (max-width: 900px) {
          .cruise-filter-inner {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .cruise-filter-btn {
            grid-column: span 2 / span 2;
            width: 100%;
          }
        }
        @media (max-width: 600px) {
          .cruise-filter-bar {
            border-radius: 20px;
            padding: 14px 14px;
          }
          .cruise-filter-inner {
            grid-template-columns: 1fr;
          }
          .cruise-filter-btn {
            grid-column: span 1 / span 1;
          }
        }

        .destinations-card-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 1100px) {
          .destinations-card-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 900px) {
          .destinations-card-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .destinations-card-row {
            grid-template-columns: 1fr;
          }
        }

        .destination-card {
          background: #111827;
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 18px 45px rgba(15,23,42,0.45);
          transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
          cursor: pointer;
        }
        .destination-card-tall {
          height: 480px;
        }
        .destination-card:hover {
          transform: translateY(-10px);
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
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(243,244,246,0.9);
        }
        .destination-title-large {
          font-size: 1.45rem;
          font-weight: 800;
          color: #f9fafb;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .destination-price-label {
          margin-top: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(209,213,219,0.9);
        }
        .destination-price {
          font-size: 1.5rem;
          font-weight: 900;
          color: #f9fafb;
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
    </div>
  );
};

export default DestinationsPage; 