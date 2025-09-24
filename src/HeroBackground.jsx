import React from 'react';
import HeroImage from './assets/Hero.jpg';

const HeroBackground = ({ children, fullHeight = false }) => {
  return (
    <div
      style={{
        minHeight: fullHeight ? "100vh" : "50vh",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${HeroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          background: "rgba(16,24,32,0.25)",
          zIndex: 1,
        }}
      />
      
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default HeroBackground;