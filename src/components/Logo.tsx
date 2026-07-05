'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', height }) => {
  return (
    <img
      src="/logo.svg"
      alt="House of Outliers Logo"
      className={className}
      style={{
        height: height ? `${height}px` : undefined,
        width: 'auto',
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
};

export default Logo;
