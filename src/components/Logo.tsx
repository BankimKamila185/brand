'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', height = 42 }) => {
  return (
    <img
      src="https://houseofkoala.com/cdn/shop/files/Logo-_HOK.png?v=1732368245"
      alt="House of Koala Logo"
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
