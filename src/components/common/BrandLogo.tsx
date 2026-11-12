import React from 'react';

interface BrandLogoProps {
  className?: string;
  isLight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  isLight = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const strokeColor = isLight ? '#F8F5EC' : '#244638';
  const fillColor = isLight ? '#244638' : '#F8F5EC';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* House with fork & spoon icon matching the original logo */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizes[size]} transition-transform duration-300 hover:scale-105 shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* House Roof */}
        <path
          d="M50 10 L88 34 L80 34 L80 88 L20 88 L20 34 L12 34 Z"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill={fillColor}
        />
        {/* Window */}
        <rect
          x="42"
          y="24"
          width="16"
          height="18"
          rx="2"
          stroke={strokeColor}
          strokeWidth="3.5"
          fill={strokeColor}
          fillOpacity="0.15"
        />
        <line x1="50" y1="24" x2="50" y2="42" stroke={strokeColor} strokeWidth="2.5" />
        <line x1="42" y1="33" x2="58" y2="33" stroke={strokeColor} strokeWidth="2.5" />
        {/* Left Fork */}
        <path
          d="M28 52 V62 M25 52 V58 H31 V52 M28 62 V78"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Spoon */}
        <path
          d="M72 52 C67 52 67 62 72 62 C77 62 77 52 72 52 Z M72 62 V78"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center Plate */}
        <circle cx="50" cy="65" r="12" stroke={strokeColor} strokeWidth="3.5" fill="#FFFFFF" />
        <circle cx="50" cy="65" r="7.5" stroke="#777F52" strokeWidth="1.8" strokeDasharray="2 2" />
        <path d="M50 65 L55 60 M50 65 L45 60" stroke="#BD8061" strokeWidth="2.2" strokeLinecap="round" />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-serif font-bold tracking-tight leading-none ${textSizes[size]} ${
            isLight ? 'text-cream' : 'text-forest'
          }`}
        >
          Urmila's
        </span>
        <span
          className={`text-xs uppercase tracking-widest font-semibold ${
            isLight ? 'text-sage-light' : 'text-olive'
          } -mt-0.5`}
        >
          Kitchen
        </span>
      </div>
    </div>
  );
};
