import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import destiImg from './assets/desti.webp';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

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
    if (!term) {
      setFiltered(destinations);
      return;
    }
    setFiltered(destinations.filter(dest =>
      (dest.route && dest.route.toLowerCase().includes(term)) ||
      (dest.ship_name && dest.ship_name.toLowerCase().includes(term))
    ));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <section
        id="destinations"
        style={{
          background: "#fff",
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
          fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
          marginBottom: '1rem'
        }}>
          Featured Destinations
        </h2>
        <p className="lead text-muted text-center mb-5" style={{ 
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)", 
          maxWidth: 600, 
          margin: "0 auto 2rem auto",
          padding: '0 1rem'
        }}>
          Discover breathtaking destinations around the world with our premium cruise experiences
        </p>
        <div className="featured-search-card modern-search-bar">
          <div className="modern-search-bar-inner">
            <span className="modern-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by country or ship name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="modern-search-input"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
            <button
              onClick={handleSearch}
              className="modern-search-btn"
            >
              Search
            </button>
          </div>
        </div>
        
        {/* Responsive Destinations Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
        }}>
          {filtered.map((dest, idx) => {
            const calculatedNights = calculateNights(dest.start_date, dest.end_date);
            return (
              <Link
                key={idx}
                to={`/destination/${dest.route ? dest.route.toLowerCase() : ''}`}
                state={{ destination: dest }}
                style={{ textDecoration: 'none' }}
              >
                <div className="destination-card">
                  <img
                    className="destination-image"
                    src={dest.country_image ? `http://localhost/Project-I/backend/${dest.country_image}` : '/assets/default.jpg'}
                    alt={dest.route}
                  />
                  <div className="destination-overlay">
                    <div className="destination-title">{dest.route}</div>
                    <div className="destination-desc">{dest.description}</div>
                    {(dest.start_date && dest.end_date) && (
                      <div className="destination-dates mt-2" style={{fontSize: '1.05rem', fontWeight: 500, color: '#ffd600'}}>
                        <span>Trip Dates: </span>
                        <span>{formatDate(dest.start_date)} &ndash; {formatDate(dest.end_date)}</span>
                      </div>
                    )}
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
        body, #destinations {
          background: linear-gradient(-45deg, #a1c4fd, #c2e9fb, #fbc2eb, #fcb69f);
          background-size: 400% 400%;
          animation: gradientBG 18s ease infinite;
        }
        @keyframes gradientBG {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
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
          background: #fff !important;
        }
        @media (min-width: 900px) {
          #destinations {
            min-height: 70vh;
          }
        }
        .modern-search-bar {
          background: rgba(255,255,255,0.85);
          border-radius: 22px;
          box-shadow: 0 4px 24px 0 rgba(30,58,138,0.10);
          padding: 18px 18px;
          max-width: 540px;
          margin: 0 auto 2.5rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modern-search-bar-inner {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 0.5rem;
        }
        .modern-search-icon {
          font-size: 1.5rem;
          color: #2563eb;
          margin-right: 0.5rem;
          margin-left: 0.5rem;
        }
        .modern-search-input {
          flex: 1;
          padding: 14px 16px 14px 12px;
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          background: #f3f6fd;
          color: #222;
          box-shadow: 0 2px 8px rgba(58,90,152,0.07);
          outline: none;
          transition: box-shadow 0.2s;
        }
        .modern-search-input:focus {
          box-shadow: 0 4px 16px rgba(58,90,152,0.13);
        }
        .modern-search-btn {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 16px;
          padding: 14px 32px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(58,90,152,0.07);
        }
        .modern-search-btn:hover {
          background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
          color: #ffd600;
        }
        @media (max-width: 700px) {
          .featured-search-card {
            padding: 18px 6px;
            max-width: 98vw;
          }
          .featured-search-btn {
            padding: 12px 18px;
            font-size: 1rem;
          }
        }
        .destination-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px rgba(30,58,138,0.10);
          overflow: hidden;
          transition: transform 0.18s, box-shadow 0.18s;
          margin-bottom: 32px;
          position: relative;
        }
        .destination-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 8px 32px rgba(30,58,138,0.18);
        }
        .destination-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 18px 18px 0 0;
          transition: filter 0.2s;
        }
        .destination-card:hover .destination-image {
          filter: brightness(0.92) blur(1px);
        }
        .destination-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(0deg, rgba(30,58,138,0.7) 0%, rgba(30,58,138,0.0) 100%);
          color: #fff;
          padding: 18px 24px 12px 24px;
          border-radius: 0 0 18px 18px;
        }
        .destination-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .destination-desc {
          font-size: 1.05rem;
          opacity: 0.92;
        }
      `}</style>
    </div>
  );
};

export default DestinationsPage; 