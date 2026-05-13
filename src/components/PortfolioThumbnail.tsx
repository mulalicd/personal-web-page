import { memo } from "react";

// Unique minimalist SVG thumbnails for each portfolio item
// Uses geometric shapes, lines and patterns specific to each industry/project

interface PortfolioThumbnailProps {
  id: number;
  industry: string;
  type: "app" | "prompt";
  className?: string;
}

// Color palettes per industry category (using HSL values matching our design system)
const getColors = (industry: string): { primary: string; secondary: string; accent: string } => {
  const colorMap: Record<string, { primary: string; secondary: string; accent: string }> = {
    Sales: { primary: "#3b82f6", secondary: "#dbeafe", accent: "#1d4ed8" },
    Healthcare: { primary: "#10b981", secondary: "#d1fae5", accent: "#047857" },
    "Healthcare / AI": { primary: "#10b981", secondary: "#d1fae5", accent: "#047857" },
    Banking: { primary: "#6366f1", secondary: "#e0e7ff", accent: "#4338ca" },
    "SaaS / IT": { primary: "#8b5cf6", secondary: "#ede9fe", accent: "#6d28d9" },
    Hospitality: { primary: "#f59e0b", secondary: "#fef3c7", accent: "#d97706" },
    Pharmacy: { primary: "#ec4899", secondary: "#fce7f3", accent: "#be185d" },
    Pharma: { primary: "#ec4899", secondary: "#fce7f3", accent: "#be185d" },
    Manufacturing: { primary: "#64748b", secondary: "#f1f5f9", accent: "#334155" },
    Finance: { primary: "#0891b2", secondary: "#cffafe", accent: "#0e7490" },
    "Finance / Tax": { primary: "#0891b2", secondary: "#cffafe", accent: "#0e7490" },
    "Transport / Logistics": { primary: "#f97316", secondary: "#ffedd5", accent: "#c2410c" },
    Transport: { primary: "#f97316", secondary: "#ffedd5", accent: "#c2410c" },
    Insurance: { primary: "#14b8a6", secondary: "#ccfbf1", accent: "#0d9488" },
    Retail: { primary: "#a855f7", secondary: "#f3e8ff", accent: "#7c3aed" },
    Legal: { primary: "#78716c", secondary: "#f5f5f4", accent: "#44403c" },
    Education: { primary: "#2563eb", secondary: "#dbeafe", accent: "#1e40af" },
    Construction: { primary: "#ea580c", secondary: "#fff7ed", accent: "#9a3412" },
    "Construction / Procurement": { primary: "#ea580c", secondary: "#fff7ed", accent: "#9a3412" },
    Energy: { primary: "#eab308", secondary: "#fefce8", accent: "#a16207" },
    HR: { primary: "#06b6d4", secondary: "#cffafe", accent: "#0891b2" },
    Logistics: { primary: "#f97316", secondary: "#ffedd5", accent: "#c2410c" },
    "Tourism / Hotels": { primary: "#f59e0b", secondary: "#fef3c7", accent: "#d97706" },
    Marketing: { primary: "#e11d48", secondary: "#ffe4e6", accent: "#be123c" },
    "E-commerce": { primary: "#a855f7", secondary: "#f3e8ff", accent: "#7c3aed" },
    Industry: { primary: "#64748b", secondary: "#f1f5f9", accent: "#334155" },
    "IT / Legal": { primary: "#6366f1", secondary: "#e0e7ff", accent: "#4338ca" },
    "IT / DevOps": { primary: "#8b5cf6", secondary: "#ede9fe", accent: "#6d28d9" },
    "AI / Tech": { primary: "#8b5cf6", secondary: "#ede9fe", accent: "#6d28d9" },
    "AI Governance": { primary: "#6366f1", secondary: "#e0e7ff", accent: "#4338ca" },
    Management: { primary: "#0ea5e9", secondary: "#e0f2fe", accent: "#0284c7" },
    Corporate: { primary: "#0ea5e9", secondary: "#e0f2fe", accent: "#0284c7" },
    "PR / Comms": { primary: "#e11d48", secondary: "#ffe4e6", accent: "#be123c" },
    Regulatory: { primary: "#78716c", secondary: "#f5f5f4", accent: "#44403c" },
  };
  return colorMap[industry] || { primary: "#3b82f6", secondary: "#dbeafe", accent: "#1d4ed8" };
};

// Each ID gets a unique geometric pattern
const patterns: Record<number, (colors: { primary: string; secondary: string; accent: string }) => JSX.Element> = {
  // Web Apps (1-20)
  1: (c) => (
    <g>
      <rect x="20" y="30" width="60" height="40" rx="4" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <line x1="30" y1="45" x2="70" y2="45" stroke={c.primary} strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="52" x2="55" y2="52" stroke={c.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="68" cy="38" r="4" fill={c.primary} opacity="0.8"/>
      <path d="M25 60 L40 55 L55 58 L70 50" stroke={c.primary} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </g>
  ),
  2: (c) => (
    <g>
      <path d="M50 25 L50 75" stroke={c.secondary} strokeWidth="1"/>
      <path d="M25 50 L75 50" stroke={c.secondary} strokeWidth="1"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke={c.primary} strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="8" fill={c.secondary}/>
      <path d="M50 30 A20 20 0 0 1 70 50" stroke={c.accent} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <rect x="42" y="42" width="16" height="16" rx="3" fill={c.primary} opacity="0.15"/>
    </g>
  ),
  3: (c) => (
    <g>
      <rect x="22" y="28" width="56" height="44" rx="6" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <line x1="30" y1="40" x2="70" y2="40" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <line x1="30" y1="50" x2="70" y2="50" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <line x1="30" y1="60" x2="70" y2="60" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <rect x="30" y="34" width="12" height="4" rx="1" fill={c.primary}/>
      <rect x="30" y="44" width="20" height="4" rx="1" fill={c.accent} opacity="0.6"/>
      <circle cx="65" cy="55" r="6" fill={c.primary} opacity="0.2"/>
      <path d="M62 55 L65 58 L70 52" stroke={c.primary} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </g>
  ),
  4: (c) => (
    <g>
      <circle cx="35" cy="40" r="8" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <circle cx="55" cy="35" r="6" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <circle cx="65" cy="55" r="10" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <line x1="42" y1="42" x2="50" y2="38" stroke={c.accent} strokeWidth="1" opacity="0.5"/>
      <line x1="60" y1="38" x2="62" y2="47" stroke={c.accent} strokeWidth="1" opacity="0.5"/>
      <path d="M30 65 Q50 55 70 65" stroke={c.primary} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
    </g>
  ),
  5: (c) => (
    <g>
      <rect x="25" y="30" width="50" height="35" rx="4" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <rect x="35" y="65" width="30" height="8" rx="2" fill={c.secondary} stroke={c.primary} strokeWidth="1"/>
      <path d="M30 55 L40 45 L50 50 L60 38 L70 42" stroke={c.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="38" r="3" fill={c.accent}/>
    </g>
  ),
  6: (c) => (
    <g>
      <rect x="35" y="25" width="30" height="50" rx="8" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <line x1="35" y1="38" x2="65" y2="38" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <circle cx="50" cy="31" r="2" fill={c.primary} opacity="0.5"/>
      <rect x="40" y="43" width="8" height="8" rx="2" fill={c.primary} opacity="0.3"/>
      <rect x="52" y="43" width="8" height="8" rx="2" fill={c.accent} opacity="0.4"/>
      <rect x="40" y="55" width="8" height="8" rx="2" fill={c.accent} opacity="0.3"/>
      <rect x="52" y="55" width="8" height="8" rx="2" fill={c.primary} opacity="0.4"/>
    </g>
  ),
  7: (c) => (
    <g>
      <rect x="20" y="55" width="12" height="20" rx="2" fill={c.primary} opacity="0.7"/>
      <rect x="36" y="45" width="12" height="30" rx="2" fill={c.primary} opacity="0.5"/>
      <rect x="52" y="35" width="12" height="40" rx="2" fill={c.primary} opacity="0.8"/>
      <rect x="68" y="40" width="12" height="35" rx="2" fill={c.accent} opacity="0.6"/>
      <path d="M26 50 L42 40 L58 30 L74 35" stroke={c.accent} strokeWidth="1.5" fill="none" strokeDasharray="3 2"/>
    </g>
  ),
  8: (c) => (
    <g>
      <rect x="25" y="28" width="50" height="44" rx="4" fill={c.secondary}/>
      <line x1="30" y1="38" x2="70" y2="38" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <rect x="30" y="42" width="35" height="3" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="30" y="48" width="28" height="3" rx="1" fill={c.primary} opacity="0.3"/>
      <rect x="30" y="54" width="32" height="3" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="30" y="60" width="25" height="3" rx="1" fill={c.accent} opacity="0.5"/>
      <circle cx="68" cy="32" r="3" fill={c.primary}/>
    </g>
  ),
  9: (c) => (
    <g>
      <circle cx="30" cy="40" r="4" fill={c.primary}/>
      <circle cx="70" cy="60" r="4" fill={c.accent}/>
      <circle cx="55" cy="35" r="3" fill={c.primary} opacity="0.5"/>
      <circle cx="45" cy="65" r="3" fill={c.primary} opacity="0.5"/>
      <path d="M30 40 Q40 30 55 35 Q65 38 70 60" stroke={c.primary} strokeWidth="1.5" fill="none" strokeDasharray="4 2"/>
      <path d="M30 40 Q45 70 45 65 Q45 60 70 60" stroke={c.accent} strokeWidth="1" fill="none" opacity="0.5"/>
    </g>
  ),
  10: (c) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="none" stroke={c.secondary} strokeWidth="8"/>
      <circle cx="50" cy="50" r="22" fill="none" stroke={c.primary} strokeWidth="2" strokeDasharray="20 50" strokeDashoffset="0"/>
      <circle cx="50" cy="50" r="22" fill="none" stroke={c.accent} strokeWidth="2" strokeDasharray="15 55" strokeDashoffset="35"/>
      <circle cx="50" cy="50" r="10" fill={c.secondary}/>
      <path d="M46 50 L49 53 L55 47" stroke={c.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </g>
  ),
  11: (c) => (
    <g>
      <rect x="25" y="30" width="15" height="40" rx="3" fill={c.primary} opacity="0.6"/>
      <rect x="43" y="40" width="15" height="30" rx="3" fill={c.primary} opacity="0.8"/>
      <rect x="61" y="25" width="15" height="45" rx="3" fill={c.accent} opacity="0.7"/>
      <line x1="20" y1="72" x2="80" y2="72" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <circle cx="32" cy="26" r="3" fill={c.primary} opacity="0.4"/>
      <circle cx="68" cy="21" r="3" fill={c.accent} opacity="0.4"/>
    </g>
  ),
  12: (c) => (
    <g>
      <rect x="25" y="25" width="50" height="50" rx="4" fill={c.secondary}/>
      <line x1="30" y1="35" x2="70" y2="35" stroke={c.primary} strokeWidth="1" opacity="0.2"/>
      <rect x="30" y="39" width="40" height="3" rx="1" fill={c.primary} opacity="0.3"/>
      <rect x="30" y="45" width="35" height="3" rx="1" fill={c.primary} opacity="0.2"/>
      <rect x="30" y="51" width="38" height="3" rx="1" fill={c.accent} opacity="0.4"/>
      <rect x="30" y="57" width="30" height="3" rx="1" fill={c.primary} opacity="0.2"/>
      <rect x="55" y="63" width="15" height="6" rx="2" fill={c.primary} opacity="0.6"/>
    </g>
  ),
  13: (c) => (
    <g>
      <circle cx="35" cy="50" r="15" fill="none" stroke={c.primary} strokeWidth="1.5"/>
      <circle cx="35" cy="50" r="6" fill={c.secondary}/>
      <line x1="35" y1="44" x2="35" y2="38" stroke={c.primary} strokeWidth="2" strokeLinecap="round"/>
      <line x1="35" y1="50" x2="42" y2="50" stroke={c.accent} strokeWidth="2" strokeLinecap="round"/>
      <path d="M55 40 L75 40 L75 60 L55 60 Z" fill={c.secondary} stroke={c.primary} strokeWidth="1"/>
      <line x1="58" y1="47" x2="72" y2="47" stroke={c.primary} strokeWidth="1" opacity="0.4"/>
      <line x1="58" y1="53" x2="68" y2="53" stroke={c.accent} strokeWidth="1" opacity="0.4"/>
    </g>
  ),
  14: (c) => (
    <g>
      <rect x="22" y="28" width="56" height="44" rx="4" fill={c.secondary}/>
      <line x1="22" y1="38" x2="78" y2="38" stroke={c.primary} strokeWidth="1" opacity="0.3"/>
      <line x1="40" y1="38" x2="40" y2="72" stroke={c.primary} strokeWidth="1" opacity="0.2"/>
      <line x1="58" y1="38" x2="58" y2="72" stroke={c.primary} strokeWidth="1" opacity="0.2"/>
      <rect x="26" y="42" width="10" height="6" rx="1" fill={c.primary} opacity="0.3"/>
      <rect x="44" y="42" width="10" height="6" rx="1" fill={c.accent} opacity="0.4"/>
      <rect x="62" y="42" width="10" height="6" rx="1" fill={c.primary} opacity="0.3"/>
      <rect x="26" y="52" width="10" height="6" rx="1" fill={c.accent} opacity="0.4"/>
      <rect x="44" y="52" width="10" height="6" rx="1" fill={c.primary} opacity="0.5"/>
      <rect x="62" y="52" width="10" height="6" rx="1" fill={c.primary} opacity="0.2"/>
      <rect x="26" y="62" width="10" height="6" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="44" y="62" width="10" height="6" rx="1" fill={c.primary} opacity="0.2"/>
      <rect x="62" y="62" width="10" height="6" rx="1" fill={c.accent} opacity="0.5"/>
    </g>
  ),
  15: (c) => (
    <g>
      <path d="M30 70 L50 30 L70 70 Z" fill="none" stroke={c.primary} strokeWidth="1.5"/>
      <line x1="38" y1="55" x2="62" y2="55" stroke={c.primary} strokeWidth="1" opacity="0.4"/>
      <line x1="43" y1="45" x2="57" y2="45" stroke={c.accent} strokeWidth="1" opacity="0.4"/>
      <circle cx="50" cy="55" r="5" fill={c.secondary} stroke={c.primary} strokeWidth="1"/>
      <rect x="25" y="70" width="50" height="5" rx="2" fill={c.primary} opacity="0.2"/>
    </g>
  ),
  16: (c) => (
    <g>
      <path d="M25 60 Q35 35 50 45 Q65 55 75 30" stroke={c.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M25 65 Q35 50 50 55 Q65 60 75 45" stroke={c.accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <circle cx="75" cy="30" r="4" fill={c.primary} opacity="0.6"/>
      <line x1="25" y1="70" x2="75" y2="70" stroke={c.primary} strokeWidth="1" opacity="0.2"/>
    </g>
  ),
  17: (c) => (
    <g>
      <circle cx="40" cy="38" r="10" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/>
      <circle cx="40" cy="35" r="4" fill={c.primary} opacity="0.4"/>
      <path d="M30 50 Q40 45 50 50" fill={c.primary} opacity="0.2"/>
      <rect x="55" y="30" width="22" height="4" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="55" y="38" width="18" height="3" rx="1" fill={c.accent} opacity="0.3"/>
      <rect x="55" y="44" width="20" height="3" rx="1" fill={c.primary} opacity="0.3"/>
      <rect x="30" y="58" width="40" height="14" rx="3" fill={c.secondary} stroke={c.primary} strokeWidth="1"/>
      <rect x="34" y="62" width="15" height="2" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="34" y="67" width="10" height="2" rx="1" fill={c.accent} opacity="0.3"/>
    </g>
  ),
  18: (c) => (
    <g>
      <circle cx="50" cy="50" r="22" fill="none" stroke={c.secondary} strokeWidth="6"/>
      <path d="M50 28 A22 22 0 0 1 72 50" fill="none" stroke={c.primary} strokeWidth="3" strokeLinecap="round"/>
      <path d="M72 50 A22 22 0 0 1 50 72" fill="none" stroke={c.accent} strokeWidth="3" strokeLinecap="round"/>
      <path d="M50 72 A22 22 0 0 1 28 50" fill="none" stroke={c.primary} strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <circle cx="50" cy="50" r="8" fill={c.secondary}/>
      <text x="50" y="54" textAnchor="middle" fontSize="8" fill={c.primary} fontWeight="bold">%</text>
    </g>
  ),
  19: (c) => (
    <g>
      <rect x="25" y="30" width="20" height="28" rx="3" fill={c.secondary} stroke={c.primary} strokeWidth="1"/>
      <rect x="30" y="35" width="10" height="3" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="30" y="41" width="8" height="3" rx="1" fill={c.accent} opacity="0.3"/>
      <rect x="30" y="47" width="12" height="3" rx="1" fill={c.primary} opacity="0.3"/>
      <path d="M48 44 L55 38 L55 50 Z" fill={c.primary} opacity="0.6"/>
      <rect x="58" y="32" width="18" height="24" rx="3" fill={c.secondary} stroke={c.accent} strokeWidth="1"/>
      <line x1="62" y1="40" x2="72" y2="40" stroke={c.accent} strokeWidth="1" opacity="0.4"/>
      <line x1="62" y1="45" x2="70" y2="45" stroke={c.accent} strokeWidth="1" opacity="0.3"/>
      <line x1="62" y1="50" x2="72" y2="50" stroke={c.accent} strokeWidth="1" opacity="0.4"/>
      <path d="M30 65 L50 62 L70 68" stroke={c.primary} strokeWidth="1" fill="none" strokeDasharray="2 2"/>
    </g>
  ),
  20: (c) => (
    <g>
      <rect x="25" y="28" width="50" height="44" rx="4" fill={c.secondary}/>
      <rect x="30" y="33" width="6" height="6" rx="1" fill={c.primary} opacity="0.4"/>
      <rect x="38" y="33" width="6" height="6" rx="1" fill={c.accent} opacity="0.5"/>
      <rect x="46" y="33" width="6" height="6" rx="1" fill={c.primary} opacity="0.3"/>
      <rect x="54" y="33" width="6" height="6" rx="1" fill={c.primary} opacity="0.6"/>
      <rect x="62" y="33" width="6" height="6" rx="1" fill={c.accent} opacity="0.3"/>
      <path d="M30 48 L38 45 L46 50 L54 42 L62 47 L70 44" stroke={c.primary} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="30" y="56" width="40" height="10" rx="2" fill={c.primary} opacity="0.1"/>
      <line x1="35" y1="61" x2="65" y2="61" stroke={c.primary} strokeWidth="1" opacity="0.3" strokeDasharray="3 2"/>
    </g>
  ),
  // AI Prompts (21-60) - unique patterns for each
  21: (c) => (<g><rect x="28" y="30" width="44" height="40" rx="4" fill={c.secondary}/><line x1="33" y1="38" x2="67" y2="38" stroke={c.primary} strokeWidth="1.5" strokeLinecap="round"/><line x1="33" y1="45" x2="55" y2="45" stroke={c.primary} strokeWidth="1" opacity="0.4"/><line x1="33" y1="51" x2="60" y2="51" stroke={c.accent} strokeWidth="1" opacity="0.4"/><line x1="33" y1="57" x2="50" y2="57" stroke={c.primary} strokeWidth="1" opacity="0.3"/><circle cx="65" cy="60" r="5" fill={c.primary} opacity="0.15"/></g>),
  22: (c) => (<g><rect x="28" y="28" width="44" height="44" rx="6" fill={c.secondary}/><path d="M35 40 L45 40 L45 60 L55 60 L55 35 L65 35 L65 65" stroke={c.primary} strokeWidth="1.5" fill="none"/><circle cx="35" cy="40" r="2" fill={c.primary}/><circle cx="65" cy="65" r="2" fill={c.accent}/></g>),
  23: (c) => (<g><circle cx="50" cy="50" r="20" fill={c.secondary}/><path d="M50 30 L50 50 L65 50" stroke={c.primary} strokeWidth="1.5" fill="none"/><path d="M50 30 A20 20 0 0 1 70 50" fill={c.primary} opacity="0.2"/><text x="50" y="54" textAnchor="middle" fontSize="7" fill={c.accent} fontWeight="bold">$</text></g>),
  24: (c) => (<g><rect x="30" y="28" width="40" height="44" rx="3" fill={c.secondary} stroke={c.primary} strokeWidth="1"/><line x1="36" y1="36" x2="64" y2="36" stroke={c.primary} strokeWidth="1" opacity="0.3"/><rect x="36" y="40" width="28" height="3" rx="1" fill={c.primary} opacity="0.3"/><rect x="36" y="46" width="22" height="3" rx="1" fill={c.accent} opacity="0.4"/><rect x="36" y="52" width="25" height="3" rx="1" fill={c.primary} opacity="0.3"/><rect x="36" y="58" width="18" height="3" rx="1" fill={c.primary} opacity="0.2"/><circle cx="62" cy="64" r="4" fill={c.primary} opacity="0.2"/></g>),
  25: (c) => (<g><rect x="25" y="55" width="10" height="18" rx="2" fill={c.primary} opacity="0.5"/><rect x="38" y="45" width="10" height="28" rx="2" fill={c.primary} opacity="0.7"/><rect x="51" y="35" width="10" height="38" rx="2" fill={c.accent} opacity="0.6"/><rect x="64" y="50" width="10" height="23" rx="2" fill={c.primary} opacity="0.4"/><path d="M30 52 L43 42 L56 32 L69 47" stroke={c.accent} strokeWidth="1.5" fill="none" strokeDasharray="3 2"/></g>),
  26: (c) => (<g><circle cx="40" cy="45" r="12" fill="none" stroke={c.primary} strokeWidth="1.5"/><circle cx="60" cy="55" r="12" fill="none" stroke={c.accent} strokeWidth="1.5"/><line x1="48" y1="38" x2="65" y2="30" stroke={c.primary} strokeWidth="1" opacity="0.3"/><circle cx="65" cy="30" r="3" fill={c.accent} opacity="0.5"/></g>),
  27: (c) => (<g><circle cx="30" cy="40" r="4" fill={c.primary}/><circle cx="70" cy="60" r="4" fill={c.accent}/><circle cx="50" cy="30" r="3" fill={c.primary} opacity="0.5"/><circle cx="60" cy="45" r="3" fill={c.accent} opacity="0.5"/><path d="M30 40 C40 30 50 30 50 30 C55 30 60 40 60 45 C60 50 65 55 70 60" stroke={c.primary} strokeWidth="1.5" fill="none"/></g>),
  28: (c) => (<g><rect x="25" y="30" width="50" height="6" rx="3" fill={c.secondary}/><rect x="25" y="30" width="35" height="6" rx="3" fill={c.primary} opacity="0.5"/><rect x="25" y="42" width="50" height="6" rx="3" fill={c.secondary}/><rect x="25" y="42" width="42" height="6" rx="3" fill={c.accent} opacity="0.5"/><rect x="25" y="54" width="50" height="6" rx="3" fill={c.secondary}/><rect x="25" y="54" width="28" height="6" rx="3" fill={c.primary} opacity="0.4"/><rect x="25" y="66" width="50" height="6" rx="3" fill={c.secondary}/><rect x="25" y="66" width="45" height="6" rx="3" fill={c.accent} opacity="0.6"/></g>),
  29: (c) => (<g><path d="M50 28 L72 42 L72 62 L50 76 L28 62 L28 42 Z" fill="none" stroke={c.primary} strokeWidth="1.5"/><path d="M50 28 L50 76" stroke={c.primary} strokeWidth="1" opacity="0.2"/><path d="M28 42 L72 62" stroke={c.primary} strokeWidth="1" opacity="0.2"/><circle cx="50" cy="50" r="8" fill={c.secondary}/><text x="50" y="54" textAnchor="middle" fontSize="8" fill={c.accent} fontWeight="bold">!</text></g>),
  30: (c) => (<g><circle cx="50" cy="50" r="18" fill="none" stroke={c.primary} strokeWidth="1.5" strokeDasharray="4 3"/><circle cx="50" cy="50" r="8" fill={c.secondary} stroke={c.accent} strokeWidth="1"/><line x1="50" y1="32" x2="50" y2="40" stroke={c.primary} strokeWidth="1.5"/><line x1="50" y1="60" x2="50" y2="68" stroke={c.primary} strokeWidth="1.5"/><line x1="32" y1="50" x2="40" y2="50" stroke={c.primary} strokeWidth="1.5"/><line x1="60" y1="50" x2="68" y2="50" stroke={c.primary} strokeWidth="1.5"/></g>),
  31: (c) => (<g><path d="M25 60 L35 45 L45 52 L55 38 L65 42 L75 30" stroke={c.primary} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M25 60 L35 55 L45 58 L55 50 L65 52 L75 45" stroke={c.accent} strokeWidth="1" fill="none" opacity="0.4"/><line x1="25" y1="70" x2="75" y2="70" stroke={c.primary} strokeWidth="1" opacity="0.2"/></g>),
  32: (c) => (<g><circle cx="40" cy="40" r="10" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><circle cx="40" cy="37" r="4" fill={c.primary} opacity="0.3"/><rect x="55" y="32" width="20" height="3" rx="1" fill={c.primary} opacity="0.4"/><rect x="55" y="38" width="15" height="3" rx="1" fill={c.accent} opacity="0.3"/><rect x="55" y="44" width="18" height="3" rx="1" fill={c.primary} opacity="0.3"/><rect x="30" y="56" width="40" height="12" rx="3" fill={c.secondary} stroke={c.primary} strokeWidth="1"/></g>),
  33: (c) => (<g><rect x="28" y="28" width="44" height="44" rx="4" fill={c.secondary}/><line x1="35" y1="36" x2="65" y2="36" stroke={c.primary} strokeWidth="1" opacity="0.3"/><rect x="35" y="40" width="30" height="4" rx="1" fill={c.primary} opacity="0.3"/><rect x="35" y="48" width="25" height="4" rx="1" fill={c.accent} opacity="0.5"/><rect x="35" y="56" width="28" height="4" rx="1" fill={c.primary} opacity="0.3"/><path d="M62 62 L66 66" stroke={c.accent} strokeWidth="2" strokeLinecap="round"/><circle cx="60" cy="60" r="4" fill="none" stroke={c.accent} strokeWidth="1.5"/></g>),
  34: (c) => (<g><rect x="25" y="28" width="22" height="30" rx="3" fill={c.secondary} stroke={c.primary} strokeWidth="1"/><rect x="53" y="28" width="22" height="30" rx="3" fill={c.secondary} stroke={c.accent} strokeWidth="1"/><path d="M47 38 L53 38" stroke={c.primary} strokeWidth="1.5"/><path d="M47 43 L53 43" stroke={c.primary} strokeWidth="1.5"/><rect x="30" y="33" width="12" height="2" rx="1" fill={c.primary} opacity="0.3"/><rect x="58" y="33" width="12" height="2" rx="1" fill={c.accent} opacity="0.3"/><rect x="30" y="38" width="10" height="2" rx="1" fill={c.primary} opacity="0.2"/><rect x="58" y="38" width="10" height="2" rx="1" fill={c.accent} opacity="0.2"/><rect x="30" y="66" width="45" height="8" rx="3" fill={c.primary} opacity="0.1"/></g>),
  35: (c) => (<g><path d="M30 55 L40 45 L50 50 L60 35 L70 40" stroke={c.primary} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M30 65 L40 60 L50 62 L60 55 L70 58" stroke={c.accent} strokeWidth="1" fill="none" opacity="0.4"/><circle cx="70" cy="40" r="3" fill={c.primary}/><text x="50" y="78" textAnchor="middle" fontSize="6" fill={c.accent} opacity="0.6">%</text></g>),
  36: (c) => (<g><circle cx="50" cy="50" r="22" fill="none" stroke={c.secondary} strokeWidth="6"/><path d="M50 28 A22 22 0 0 1 72 50" fill="none" stroke={c.primary} strokeWidth="3"/><path d="M72 50 A22 22 0 0 1 50 72" fill="none" stroke={c.accent} strokeWidth="3"/><path d="M50 72 A22 22 0 0 1 35 35" fill="none" stroke={c.primary} strokeWidth="3" opacity="0.4"/><circle cx="50" cy="50" r="6" fill={c.secondary}/></g>),
  37: (c) => (<g><path d="M25 55 Q35 40 45 48 Q55 56 65 35 Q70 28 75 30" stroke={c.primary} strokeWidth="2" fill="none"/><path d="M25 60 Q40 52 55 58 Q65 62 75 50" stroke={c.accent} strokeWidth="1.5" fill="none" opacity="0.5"/><line x1="25" y1="70" x2="75" y2="70" stroke={c.primary} strokeWidth="1" opacity="0.2"/><circle cx="65" cy="35" r="3" fill={c.primary} opacity="0.4"/></g>),
  38: (c) => (<g><rect x="28" y="28" width="44" height="44" rx="4" fill={c.secondary}/><path d="M35 35 L55 35 L55 45 L65 45 L65 55 L45 55 L45 65 L35 65 Z" stroke={c.primary} strokeWidth="1.5" fill="none"/><circle cx="38" cy="38" r="2" fill={c.primary}/><circle cx="62" cy="52" r="2" fill={c.accent}/><line x1="38" y1="38" x2="55" y2="38" stroke={c.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/></g>),
  39: (c) => (<g><rect x="25" y="30" width="15" height="35" rx="2" fill={c.primary} opacity="0.5"/><rect x="43" y="25" width="15" height="40" rx="2" fill={c.accent} opacity="0.6"/><rect x="61" y="35" width="15" height="30" rx="2" fill={c.primary} opacity="0.7"/><path d="M32 70 L50 70 L68 70" stroke={c.primary} strokeWidth="1" opacity="0.3"/><circle cx="32" cy="27" r="3" fill={c.primary} opacity="0.3"/><circle cx="50" cy="22" r="3" fill={c.accent} opacity="0.3"/><circle cx="68" cy="32" r="3" fill={c.primary} opacity="0.3"/></g>),
  40: (c) => (<g><rect x="25" y="30" width="50" height="40" rx="4" fill={c.secondary}/><line x1="50" y1="30" x2="50" y2="70" stroke={c.primary} strokeWidth="1" opacity="0.2"/><line x1="25" y1="50" x2="75" y2="50" stroke={c.primary} strokeWidth="1" opacity="0.2"/><rect x="28" y="33" width="19" height="14" rx="2" fill={c.primary} opacity="0.15"/><rect x="53" y="33" width="19" height="14" rx="2" fill={c.accent} opacity="0.15"/><rect x="28" y="53" width="19" height="14" rx="2" fill={c.accent} opacity="0.1"/><rect x="53" y="53" width="19" height="14" rx="2" fill={c.primary} opacity="0.2"/><text x="37" y="43" textAnchor="middle" fontSize="6" fill={c.primary}>A</text><text x="63" y="43" textAnchor="middle" fontSize="6" fill={c.accent}>B</text></g>),
  41: (c) => (<g><circle cx="35" cy="45" r="8" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><circle cx="50" cy="55" r="8" fill={c.secondary} stroke={c.accent} strokeWidth="1.5"/><circle cx="65" cy="45" r="8" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><line x1="42" y1="48" x2="43" y2="52" stroke={c.primary} strokeWidth="1" opacity="0.4"/><line x1="57" y1="52" x2="58" y2="48" stroke={c.accent} strokeWidth="1" opacity="0.4"/><rect x="35" y="68" width="30" height="4" rx="2" fill={c.primary} opacity="0.2"/></g>),
  42: (c) => (<g><circle cx="50" cy="50" r="20" fill="none" stroke={c.primary} strokeWidth="1.5"/><path d="M35 40 L45 50 L65 35" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M35 55 L65 55" stroke={c.primary} strokeWidth="1" opacity="0.3"/><path d="M40 62 L60 62" stroke={c.primary} strokeWidth="1" opacity="0.2"/></g>),
  43: (c) => (<g><path d="M30 65 L40 45 L50 55 L60 35 L70 45" stroke={c.primary} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="60" cy="35" r="4" fill="none" stroke={c.accent} strokeWidth="1.5"/><text x="60" y="38" textAnchor="middle" fontSize="6" fill={c.accent}>!</text><line x1="25" y1="70" x2="75" y2="70" stroke={c.primary} strokeWidth="1" opacity="0.2"/></g>),
  44: (c) => (<g><path d="M30 60 L40 50 L50 55 L60 40 L70 45" stroke={c.primary} strokeWidth="1.5" fill="none"/><path d="M30 55 L40 48 L50 52 L60 38 L70 42" stroke={c.primary} strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="3 2"/><path d="M30 65 L40 52 L50 58 L60 42 L70 48" stroke={c.accent} strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="3 2"/><circle cx="60" cy="40" r="3" fill={c.accent} opacity="0.5"/></g>),
  45: (c) => (<g><circle cx="50" cy="50" r="20" fill="none" stroke={c.secondary} strokeWidth="3"/><circle cx="50" cy="50" r="20" fill="none" stroke={c.primary} strokeWidth="2" strokeDasharray="15 50" strokeDashoffset="0"/><circle cx="50" cy="50" r="20" fill="none" stroke={c.accent} strokeWidth="2" strokeDasharray="10 55" strokeDashoffset="25"/><circle cx="50" cy="50" r="20" fill="none" stroke={c.primary} strokeWidth="2" strokeDasharray="12 53" strokeDashoffset="50" opacity="0.5"/><circle cx="50" cy="50" r="7" fill={c.secondary}/></g>),
  46: (c) => (<g><rect x="25" y="28" width="50" height="8" rx="4" fill={c.secondary}/><rect x="25" y="28" width="40" height="8" rx="4" fill={c.primary} opacity="0.4"/><rect x="25" y="42" width="50" height="8" rx="4" fill={c.secondary}/><rect x="25" y="42" width="30" height="8" rx="4" fill={c.accent} opacity="0.4"/><rect x="25" y="56" width="50" height="8" rx="4" fill={c.secondary}/><rect x="25" y="56" width="20" height="8" rx="4" fill={c.primary} opacity="0.3"/><circle cx="72" cy="32" r="3" fill={c.accent} opacity="0.5"/></g>),
  47: (c) => (<g><rect x="30" y="28" width="40" height="44" rx="4" fill={c.secondary} stroke={c.primary} strokeWidth="1"/><circle cx="50" cy="42" r="8" fill="none" stroke={c.primary} strokeWidth="1.5"/><path d="M46 42 L50 46 L55 38" stroke={c.accent} strokeWidth="1.5" fill="none" strokeLinecap="round"/><line x1="36" y1="56" x2="64" y2="56" stroke={c.primary} strokeWidth="1" opacity="0.3"/><line x1="36" y1="62" x2="56" y2="62" stroke={c.primary} strokeWidth="1" opacity="0.2"/></g>),
  48: (c) => (<g><rect x="28" y="30" width="44" height="40" rx="4" fill={c.secondary}/><line x1="35" y1="38" x2="65" y2="38" stroke={c.primary} strokeWidth="1.5" strokeLinecap="round"/><line x1="35" y1="45" x2="58" y2="45" stroke={c.primary} strokeWidth="1" opacity="0.4"/><line x1="35" y1="51" x2="52" y2="51" stroke={c.accent} strokeWidth="1" opacity="0.3"/><line x1="35" y1="57" x2="60" y2="57" stroke={c.primary} strokeWidth="1" opacity="0.3"/><rect x="55" y="62" width="12" height="5" rx="2" fill={c.primary} opacity="0.4"/></g>),
  49: (c) => (<g><path d="M50 28 L65 38 L65 58 L50 68 L35 58 L35 38 Z" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><line x1="50" y1="40" x2="50" y2="55" stroke={c.accent} strokeWidth="2" strokeLinecap="round"/><line x1="44" y1="47" x2="56" y2="47" stroke={c.accent} strokeWidth="2" strokeLinecap="round"/></g>),
  50: (c) => (<g><rect x="25" y="30" width="20" height="40" rx="3" fill={c.secondary} stroke={c.primary} strokeWidth="1"/><rect x="55" y="30" width="20" height="40" rx="3" fill={c.secondary} stroke={c.accent} strokeWidth="1"/><path d="M45 45 L55 45" stroke={c.primary} strokeWidth="2" strokeLinecap="round"/><path d="M45 50 L55 50" stroke={c.primary} strokeWidth="2" strokeLinecap="round"/><path d="M45 55 L55 55" stroke={c.accent} strokeWidth="2" strokeLinecap="round"/></g>),
  51: (c) => (<g><circle cx="35" cy="40" r="6" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><circle cx="65" cy="40" r="6" fill={c.secondary} stroke={c.accent} strokeWidth="1.5"/><circle cx="50" cy="60" r="6" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><line x1="40" y1="43" x2="46" y2="57" stroke={c.primary} strokeWidth="1"/><line x1="60" y1="43" x2="54" y2="57" stroke={c.accent} strokeWidth="1"/><line x1="41" y1="40" x2="59" y2="40" stroke={c.primary} strokeWidth="1" opacity="0.4"/></g>),
  52: (c) => (<g><rect x="28" y="28" width="44" height="44" rx="4" fill={c.secondary}/><line x1="35" y1="38" x2="65" y2="38" stroke={c.primary} strokeWidth="1" opacity="0.3"/><rect x="35" y="42" width="30" height="3" rx="1" fill={c.primary} opacity="0.3"/><rect x="35" y="48" width="30" height="3" rx="1" fill={c.accent} opacity="0.5" strokeWidth="0.5" stroke={c.accent}/><rect x="35" y="54" width="30" height="3" rx="1" fill={c.primary} opacity="0.2"/><rect x="35" y="60" width="20" height="3" rx="1" fill={c.primary} opacity="0.3"/></g>),
  53: (c) => (<g><circle cx="30" cy="50" r="5" fill={c.primary} opacity="0.5"/><circle cx="50" cy="50" r="5" fill={c.accent} opacity="0.5"/><circle cx="70" cy="50" r="5" fill={c.primary} opacity="0.5"/><line x1="35" y1="50" x2="45" y2="50" stroke={c.primary} strokeWidth="1.5"/><line x1="55" y1="50" x2="65" y2="50" stroke={c.accent} strokeWidth="1.5"/><path d="M30 40 L30 60" stroke={c.primary} strokeWidth="1" opacity="0.3"/><path d="M50 40 L50 60" stroke={c.accent} strokeWidth="1" opacity="0.3"/><path d="M70 40 L70 60" stroke={c.primary} strokeWidth="1" opacity="0.3"/></g>),
  54: (c) => (<g><rect x="28" y="32" width="44" height="36" rx="4" fill={c.secondary}/><circle cx="40" cy="50" r="8" fill={c.primary} opacity="0.15"/><path d="M37 50 L40 53 L45 47" stroke={c.primary} strokeWidth="1.5" fill="none" strokeLinecap="round"/><rect x="52" y="44" width="15" height="3" rx="1" fill={c.primary} opacity="0.4"/><rect x="52" y="50" width="12" height="3" rx="1" fill={c.accent} opacity="0.3"/><rect x="52" y="56" width="14" height="3" rx="1" fill={c.primary} opacity="0.3"/></g>),
  55: (c) => (<g><rect x="30" y="28" width="40" height="44" rx="4" fill={c.secondary} stroke={c.primary} strokeWidth="1"/><line x1="36" y1="36" x2="64" y2="36" stroke={c.primary} strokeWidth="1.5" strokeLinecap="round"/><line x1="36" y1="43" x2="58" y2="43" stroke={c.primary} strokeWidth="1" opacity="0.3"/><line x1="36" y1="49" x2="55" y2="49" stroke={c.accent} strokeWidth="1" opacity="0.4"/><line x1="36" y1="55" x2="60" y2="55" stroke={c.primary} strokeWidth="1" opacity="0.3"/><line x1="36" y1="61" x2="50" y2="61" stroke={c.primary} strokeWidth="1" opacity="0.2"/><circle cx="62" cy="64" r="4" fill={c.primary} opacity="0.15"/></g>),
  56: (c) => (<g><circle cx="30" cy="40" r="4" fill={c.primary}/><circle cx="50" cy="35" r="3" fill={c.accent} opacity="0.6"/><circle cx="70" cy="45" r="4" fill={c.primary} opacity="0.7"/><circle cx="40" cy="60" r="3" fill={c.accent} opacity="0.5"/><circle cx="60" cy="65" r="3" fill={c.primary} opacity="0.5"/><line x1="30" y1="40" x2="50" y2="35" stroke={c.primary} strokeWidth="1"/><line x1="50" y1="35" x2="70" y2="45" stroke={c.accent} strokeWidth="1"/><line x1="30" y1="40" x2="40" y2="60" stroke={c.primary} strokeWidth="1" opacity="0.4"/><line x1="70" y1="45" x2="60" y2="65" stroke={c.accent} strokeWidth="1" opacity="0.4"/></g>),
  57: (c) => (<g><rect x="28" y="28" width="44" height="44" rx="6" fill={c.secondary}/><rect x="35" y="35" width="14" height="14" rx="2" fill={c.primary} opacity="0.2"/><rect x="51" y="35" width="14" height="14" rx="2" fill={c.accent} opacity="0.2"/><rect x="35" y="51" width="14" height="14" rx="2" fill={c.accent} opacity="0.15"/><rect x="51" y="51" width="14" height="14" rx="2" fill={c.primary} opacity="0.25"/><circle cx="42" cy="42" r="3" fill={c.primary} opacity="0.4"/></g>),
  58: (c) => (<g><circle cx="50" cy="50" r="22" fill="none" stroke={c.primary} strokeWidth="1.5"/><path d="M46 42 L50 46 L55 38" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="38" y1="55" x2="62" y2="55" stroke={c.primary} strokeWidth="1" opacity="0.3"/><line x1="40" y1="61" x2="60" y2="61" stroke={c.primary} strokeWidth="1" opacity="0.2"/></g>),
  59: (c) => (<g><circle cx="50" cy="40" r="8" fill={c.secondary} stroke={c.primary} strokeWidth="1.5"/><circle cx="35" cy="60" r="6" fill={c.secondary} stroke={c.accent} strokeWidth="1"/><circle cx="65" cy="60" r="6" fill={c.secondary} stroke={c.primary} strokeWidth="1"/><line x1="45" y1="46" x2="38" y2="55" stroke={c.primary} strokeWidth="1"/><line x1="55" y1="46" x2="62" y2="55" stroke={c.accent} strokeWidth="1"/><line x1="41" y1="60" x2="59" y2="60" stroke={c.primary} strokeWidth="1" opacity="0.3"/></g>),
  60: (c) => (<g><rect x="25" y="30" width="50" height="40" rx="4" fill={c.secondary}/><text x="32" y="42" fontSize="7" fill={c.primary} fontFamily="monospace" opacity="0.5">{"<>"}</text><line x1="30" y1="48" x2="70" y2="48" stroke={c.primary} strokeWidth="1" opacity="0.2"/><rect x="30" y="52" width="25" height="3" rx="1" fill={c.accent} opacity="0.4"/><rect x="30" y="58" width="35" height="3" rx="1" fill={c.primary} opacity="0.3"/><rect x="30" y="64" width="20" height="3" rx="1" fill={c.primary} opacity="0.2"/></g>),
};

export const PortfolioThumbnail = memo(({ id, industry, type, className = "" }: PortfolioThumbnailProps) => {
  const colors = getColors(industry);
  const PatternComponent = patterns[id];

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="100" height="100" fill={type === "app" ? "#f8fafc" : "#fafaf9"} rx="8"/>
        
        {/* Subtle grid pattern */}
        <pattern id={`grid-${id}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.primary} strokeWidth="0.15" opacity="0.15"/>
        </pattern>
        <rect width="100" height="100" fill={`url(#grid-${id})`} rx="8"/>
        
        {/* Pattern */}
        {PatternComponent ? PatternComponent(colors) : (
          <g>
            <circle cx="50" cy="50" r="15" fill="none" stroke={colors.primary} strokeWidth="1.5"/>
            <circle cx="50" cy="50" r="5" fill={colors.secondary}/>
          </g>
        )}
      </svg>
    </div>
  );
});

PortfolioThumbnail.displayName = "PortfolioThumbnail";
