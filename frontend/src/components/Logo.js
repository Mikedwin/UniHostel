import React from 'react';

/**
 * UniHostel Brand Logo Component
 * 
 * Variants:
 * - "symbol" (default): Authentic shield emblem in brand green (#173B35) & orange (#C96E32)
 * - "reverse": Light gold/cream (#F6DEB1) emblem for dark green backgrounds
 * - "full": Complete shield + "UNIHOSTEL" lockup
 * 
 * Props:
 * - reverse: boolean - shortcut for reverse colorway
 * - variant: "symbol" | "reverse" | "full"
 * - className: CSS classes (e.g., "h-8 w-8")
 */
const Logo = ({
  className = "w-6 h-6",
  reverse = false,
  variant = "symbol",
  alt = "UniHostel",
  ...props
}) => {
  const isReverse = reverse || variant === "reverse";

  if (variant === "full") {
    const fullSrc = isReverse ? "/logo-full-reverse.png" : "/logo-full.png";
    return (
      <img
        src={fullSrc}
        alt={alt}
        className={`inline-block object-contain ${className}`}
        draggable={false}
        {...props}
      />
    );
  }

  const symbolSrc = isReverse ? "/logo-symbol-reverse.png" : "/logo-symbol.png";

  return (
    <svg
      viewBox="0 0 128 152"
      className={`inline-block shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
      {...props}
    >
      <image
        href={symbolSrc}
        width="128"
        height="152"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};

export default Logo;
