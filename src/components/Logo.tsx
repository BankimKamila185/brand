'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', height = 42 }) => {
  return (
    <img
      src="/logo.png"
      alt="The Outliers Studio Logo"
      className={className}
      style={{
        height: `${height}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
};

export default Logo;
