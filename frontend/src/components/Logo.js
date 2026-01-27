import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Building base */}
      <rect x="20" y="35" width="60" height="55" fill="#2563eb" rx="2"/>
      
      {/* Roof */}
      <path d="M15 35 L50 15 L85 35 Z" fill="#1e40af"/>
      
      {/* Windows - Row 1 */}
      <rect x="28" y="42" width="10" height="10" fill="#fbbf24" rx="1"/>
      <rect x="45" y="42" width="10" height="10" fill="#fbbf24" rx="1"/>
      <rect x="62" y="42" width="10" height="10" fill="#fbbf24" rx="1"/>
      
      {/* Windows - Row 2 */}
      <rect x="28" y="56" width="10" height="10" fill="#fbbf24" rx="1"/>
      <rect x="45" y="56" width="10" height="10" fill="#fbbf24" rx="1"/>
      <rect x="62" y="56" width="10" height="10" fill="#fbbf24" rx="1"/>
      
      {/* Windows - Row 3 */}
      <rect x="28" y="70" width="10" height="10" fill="#fbbf24" rx="1"/>
      <rect x="62" y="70" width="10" height="10" fill="#fbbf24" rx="1"/>
      
      {/* Door */}
      <rect x="43" y="75" width="14" height="15" fill="#1e3a8a" rx="1"/>
      <circle cx="54" cy="82" r="1" fill="#fbbf24"/>
      
      {/* Graduation cap on roof */}
      <rect x="45" y="18" width="10" height="3" fill="#1e3a8a" rx="0.5"/>
      <path d="M40 18 L50 13 L60 18 Z" fill="#1e3a8a"/>
      <line x1="60" y1="18" x2="63" y2="25" stroke="#1e3a8a" strokeWidth="1"/>
      <circle cx="63" cy="26" r="1.5" fill="#fbbf24"/>
    </svg>
  );
};

export default Logo;
