interface RaccoonLogoProps {
  className?: string;
}

export function RaccoonLogo({ className = "h-8 w-8" }: RaccoonLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Raccoon face - cute and friendly camping mascot */}
      
      {/* Left ear */}
      <ellipse cx="20" cy="18" rx="8" ry="10" fill="currentColor" opacity="0.9" />
      <ellipse cx="20" cy="20" rx="5" ry="6" fill="currentColor" opacity="0.4" />
      
      {/* Right ear */}
      <ellipse cx="44" cy="18" rx="8" ry="10" fill="currentColor" opacity="0.9" />
      <ellipse cx="44" cy="20" rx="5" ry="6" fill="currentColor" opacity="0.4" />
      
      {/* Head */}
      <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.9" />
      
      {/* Signature raccoon mask - dark bands around eyes */}
      <ellipse cx="25" cy="28" rx="6" ry="8" fill="currentColor" />
      <ellipse cx="39" cy="28" rx="6" ry="8" fill="currentColor" />
      
      {/* Eyes - bright and friendly */}
      <circle cx="25" cy="28" r="3.5" fill="white" />
      <circle cx="39" cy="28" r="3.5" fill="white" />
      <circle cx="26" cy="27" r="2" fill="currentColor" />
      <circle cx="40" cy="27" r="2" fill="currentColor" />
      
      {/* Eye highlights for sparkle */}
      <circle cx="26.5" cy="26.5" r="0.8" fill="white" opacity="0.8" />
      <circle cx="40.5" cy="26.5" r="0.8" fill="white" opacity="0.8" />
      
      {/* Snout */}
      <ellipse cx="32" cy="36" rx="8" ry="6" fill="currentColor" opacity="0.6" />
      
      {/* Nose */}
      <ellipse cx="32" cy="35" rx="3" ry="2.5" fill="currentColor" />
      
      {/* Mouth - cute smile */}
      <path
        d="M 32 36 Q 28 38 26 37"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 32 36 Q 36 38 38 37"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      
      {/* Whisker dots */}
      <circle cx="18" cy="32" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="34" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="46" cy="32" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="48" cy="34" r="1" fill="currentColor" opacity="0.6" />
      
      {/* Tail stripes hint (bottom right) */}
      <path
        d="M 48 45 Q 52 48 54 52"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M 50 46 Q 54 49 56 53"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
