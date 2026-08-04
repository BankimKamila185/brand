"use strict";
"use client";

import React, { useState, useEffect } from "react";

const ANNOUNCEMENTS = [
  "✦ Free Shipping Across India",
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto cycle every 5 seconds, unless user interacts
  useEffect(() => {
    if (!isVisible || ANNOUNCEMENTS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div className="announcement-bar-container">
      <div className="announcement-bar-content">
        {/* Navigation Arrow Left */}
        {ANNOUNCEMENTS.length > 1 && (
          <button
            onClick={handlePrev}
            className="announcement-nav-btn"
            aria-label="Previous announcement"
          >
            ‹
          </button>
        )}

        {/* Ticker Text */}
        <div className="announcement-text">{ANNOUNCEMENTS[currentIndex]}</div>

        {/* Navigation Arrow Right */}
        {ANNOUNCEMENTS.length > 1 && (
          <button
            onClick={handleNext}
            className="announcement-nav-btn"
            aria-label="Next announcement"
          >
            ›
          </button>
        )}
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
