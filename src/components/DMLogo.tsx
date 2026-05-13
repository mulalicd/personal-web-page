interface DMLogoProps {
  size?: number;
  className?: string;
}

export function DMLogo({ size = 32, className = "" }: DMLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DM Logo"
    >
      {/* Background circle */}
      <rect width="48" height="48" rx="12" fill="currentColor" className="text-primary" />
      {/* D letter - geometric, minimal */}
      <path
        d="M10 12h6c5.5 0 10 4.5 10 12s-4.5 12-10 12h-6V12z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        className="text-primary-foreground"
      />
      {/* M letter - angular, modern */}
      <path
        d="M28 36V12l5 12 5-12v24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="text-primary-foreground"
      />
    </svg>
  );
}

/** Inline SVG data URI for favicon use */
export const dmFaviconSvg = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="hsl(210,82%,40%)"/><path d="M10 12h6c5.5 0 10 4.5 10 12s-4.5 12-10 12h-6V12z" stroke="white" stroke-width="2.5" fill="none"/><path d="M28 36V12l5 12 5-12v24" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
)}`;
