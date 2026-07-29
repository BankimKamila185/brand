"use client";

import React from "react";

const Logo = ({ className = "", height }) => {
  return (
    <img
      src="/logo.svg"
      alt="The Outliers Studio Logo"
      className={`logo-img ${className}`}
      style={{
        ...(height ? { height: `${height}px` } : {}),
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
};

export default Logo;

