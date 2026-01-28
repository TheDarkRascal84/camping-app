interface RaccoonLogoProps {
  className?: string;
}

export function RaccoonLogo({ className = "h-8 w-8" }: RaccoonLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Full-body raccoon design inspired by reference images */}
      
      {/* Tail with distinctive stripes */}
      <path
        d="M 15 75 Q 8 82 5 90 Q 4 95 6 98"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tail stripes */}
      <path d="M 12 80 Q 9 84 7 88" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 9 87 Q 7 91 6 94" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      
      {/* Body - sitting raccoon */}
      <ellipse cx="35" cy="65" rx="22" ry="18" fill="currentColor" />
      
      {/* Back leg */}
      <ellipse cx="25" cy="78" rx="8" ry="12" fill="currentColor" opacity="0.9" />
      
      {/* Front legs */}
      <ellipse cx="30" cy="75" rx="6" ry="10" fill="currentColor" />
      <ellipse cx="42" cy="75" rx="6" ry="10" fill="currentColor" />
      
      {/* Paws - lighter color */}
      <ellipse cx="30" cy="82" rx="5" ry="4" fill="currentColor" opacity="0.6" />
      <ellipse cx="42" cy="82" rx="5" ry="4" fill="currentColor" opacity="0.6" />
      
      {/* Head */}
      <circle cx="45" cy="40" r="18" fill="currentColor" />
      
      {/* Ears */}
      <ellipse cx="36" cy="26" rx="6" ry="8" fill="currentColor" />
      <ellipse cx="54" cy="26" rx="6" ry="8" fill="currentColor" />
      <ellipse cx="36" cy="28" rx="3.5" ry="5" fill="currentColor" opacity="0.4" />
      <ellipse cx="54" cy="28" rx="3.5" ry="5" fill="currentColor" opacity="0.4" />
      
      {/* Signature raccoon mask - white patches */}
      <ellipse cx="38" cy="38" rx="7" ry="9" fill="white" />
      <ellipse cx="52" cy="38" rx="7" ry="9" fill="white" />
      
      {/* Dark eye patches over white */}
      <ellipse cx="38" cy="39" rx="5" ry="7" fill="currentColor" />
      <ellipse cx="52" cy="39" rx="5" ry="7" fill="currentColor" />
      
      {/* Eyes - bright and alert */}
      <circle cx="38" cy="39" r="3" fill="white" />
      <circle cx="52" cy="39" r="3" fill="white" />
      <circle cx="39" cy="38.5" r="1.8" fill="currentColor" />
      <circle cx="53" cy="38.5" r="1.8" fill="currentColor" />
      
      {/* Eye highlights */}
      <circle cx="39.5" cy="37.5" r="0.8" fill="white" />
      <circle cx="53.5" cy="37.5" r="0.8" fill="white" />
      
      {/* Snout/muzzle - lighter */}
      <ellipse cx="45" cy="47" rx="9" ry="7" fill="currentColor" opacity="0.5" />
      
      {/* Nose */}
      <ellipse cx="45" cy="46" rx="3" ry="2.5" fill="currentColor" />
      
      {/* Mouth - subtle smile */}
      <path
        d="M 45 47 Q 41 49 39 48"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 45 47 Q 49 49 51 48"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      
      {/* Whiskers */}
      <path d="M 32 42 L 22 40" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M 32 44 L 20 44" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M 32 46 L 22 48" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M 58 42 L 68 40" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M 58 44 L 70 44" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M 58 46 L 68 48" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      
      {/* Chest/belly marking - lighter patch */}
      <ellipse cx="35" cy="62" rx="10" ry="8" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
