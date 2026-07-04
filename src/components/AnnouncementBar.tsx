'use strict';
'use client';

import React, { useState, useEffect } from 'react';

const ANNOUNCEMENTS = [
  "END OF SEASON SALE IS LIVE NOW!",
  "USE OUTLIER21 to get additional 21% discount on orders above 5999**",
  "Use OUTLIER10 to get 10% off on orders above 2499/-",
  "Extra 5% off on Prepaid Orders",
  "Cash on Delivery(COD) available"
];

const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto cycle every 5 seconds, unless user interacts
  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div className="announcement-bar-container">
      <div className="announcement-bar-content">
        {/* Navigation Arrow Left */}
        <button 
          onClick={handlePrev} 
          className="announcement-nav-btn"
          aria-label="Previous announcement"
        >
          ‹
        </button>

        {/* Ticker Text */}
        <div className="announcement-text">
          {ANNOUNCEMENTS[currentIndex]}
        </div>

        {/* Navigation Arrow Right */}
        <button 
          onClick={handleNext} 
          className="announcement-nav-btn"
          aria-label="Next announcement"
        >
          ›
        </button>
      </div>

      {/* Dismiss Button */}
      <button 
        onClick={() => setIsVisible(false)} 
        className="announcement-close-btn"
        aria-label="Close announcement bar"
      >
        ✕
      </button>
    </div>
  );
};

export default AnnouncementBar;
