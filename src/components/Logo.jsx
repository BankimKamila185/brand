"use client";

import React from "react";

const Logo = ({ className = "", height }) => {
  return (
    <img
      src="/logo.svg"
      alt="House of Outliers Logo"
      className={className}
      style={{
        height: height ? `${height}px` : undefined,
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
};

export default Logo;
