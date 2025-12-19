import React, { useEffect, useRef } from 'react';
import './AboutSection.css';

function useCounterAnimation(ref, end, duration = 1200) {
  useEffect(() => {
    if (!ref.current) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    let current = start;
    const animate = () => {
      current += step;
      if (current > end) current = end;
      ref.current.innerText = current.toLocaleString() + '+';
      if (current < end) requestAnimationFrame(animate);
    };
    animate();
  }, [ref, end, duration]);
}

const AboutSection = () => {
  const shipsRef = useRef();
  const destRef = useRef();
  const portsRef = useRef();
  const guestsRef = useRef();
  
  useCounterAnimation(shipsRef, 10);
  useCounterAnimation(destRef, 6);
  useCounterAnimation(portsRef, 100);
  useCounterAnimation(guestsRef, 100000, 2000);

  return (
    <>
      <section id="about" className="about-luxury-section position-relative" style={{ paddingBottom: '0', background: '#f8f9fa' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-3 fw-bold mb-3" style={{ color: '#0a2540', letterSpacing: '0.5px' }}>
              WHY SERENDIP WAVES
            </h2>
            <p className="lead mx-auto" style={{ color: '#4a5568', fontSize: '1.15rem', maxWidth: '900px', lineHeight: 1.8 }}>
              Serendip Waves has been delivering innovation at sea since its launch. Each successive class of ships is a record-breaking architectural marvel that revolutionizes vacations. Today, the cruise line continues to dial up the guest experience for adventurous travelers, offering bold onboard thrills, spectacular dining options, breath-taking entertainment and world-class accommodations.
            </p>
          </div>
          
          {/* Stats Cards - 4 across */}
          <div className="row g-4 mb-5">
            <div className="col-6 col-md-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(10,37,64,0.95) 0%, rgba(26,35,50,0.95) 100%)',
                borderRadius: '20px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url("https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(10,37,64,0.85) 0%, rgba(26,35,50,0.85) 100%)',
                  zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="mb-3" style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }} ref={shipsRef}>
                    10
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    SHIPS
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-md-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(10,37,64,0.95) 0%, rgba(26,35,50,0.95) 100%)',
                borderRadius: '20px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=500")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(10,37,64,0.85) 0%, rgba(26,35,50,0.85) 100%)',
                  zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="mb-3" style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }} ref={destRef}>
                    6
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ULTIMATE<br/>DESTINATIONS
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-md-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(10,37,64,0.95) 0%, rgba(26,35,50,0.95) 100%)',
                borderRadius: '20px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url("https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=500")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(10,37,64,0.85) 0%, rgba(26,35,50,0.85) 100%)',
                  zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="mb-3" style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }} ref={portsRef}>
                    100+
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    PORTS<br/>WORLDWIDE
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-6 col-md-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(10,37,64,0.95) 0%, rgba(26,35,50,0.95) 100%)',
                borderRadius: '20px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(10,37,64,0.85) 0%, rgba(26,35,50,0.85) 100%)',
                  zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="mb-3" style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }} ref={guestsRef}>
                    1M+
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    GUESTS<br/>SAILED
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Awards Section - 4 across */}
          <div className="row g-4 mt-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-center p-4">
                <div className="mb-3">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#0a2540' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#0a2540', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BEST CRUISE LINE OVERALL
                </h5>
                <p className="mb-1" style={{ color: '#2d3748', fontSize: '0.95rem', fontWeight: 600 }}>22 YEARS RUNNING</p>
                <p className="mb-0" style={{ color: '#718096', fontSize: '0.85rem' }}>
                  Best Weekly Travel News Cruise Critic
                </p>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-center p-4">
                <div className="mb-3">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#0a2540' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#0a2540', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BEST PRIVATE ISLAND PERFECT DAY AT COCOCAY
                </h5>
                <p className="mb-1" style={{ color: '#2d3748', fontSize: '0.95rem', fontWeight: 600 }}>5 YEARS RUNNING</p>
                <p className="mb-0" style={{ color: '#718096', fontSize: '0.85rem' }}>
                  Porthole Cruise and Travel Magazine
                </p>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-center p-4">
                <div className="mb-3">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#0a2540' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#0a2540', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BEST CRUISE LINE FAMILIES
                </h5>
                <p className="mb-1" style={{ color: '#2d3748', fontSize: '0.95rem', fontWeight: 600 }}>2023</p>
                <p className="mb-0" style={{ color: '#718096', fontSize: '0.85rem' }}>
                  Cruise Critic Cruiser's Choice Awards
                </p>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-3">
              <div className="text-center p-4">
                <div className="mb-3">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#0a2540' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#0a2540', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BEST ENTERTAINMENT
                </h5>
                <p className="mb-1" style={{ color: '#2d3748', fontSize: '0.95rem', fontWeight: 600 }}>7 YEARS RUNNING</p>
                <p className="mb-0" style={{ color: '#718096', fontSize: '0.85rem' }}>
                  USA Today 10 Bests Readers Cruise Awards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;