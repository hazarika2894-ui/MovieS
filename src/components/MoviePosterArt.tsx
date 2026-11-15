import React, { useId } from 'react';
import { Movie } from '../types/cinema';

interface MoviePosterArtProps {
  movie: Movie;
  compact?: boolean;
}

export const MoviePosterArt: React.FC<MoviePosterArtProps> = ({ movie, compact = false }) => {
  const { bg, accent, secondary } = movie.palette;
  const uid = useId().replace(/:/g, '');
  const glowId = `glow-${uid}`;
  const scrimId = `scrim-${uid}`;

  const renderMotif = () => {
    switch (movie.motif) {
      case 'eclipse':
        return (
          <g>
            <circle cx="150" cy="145" r="74" fill={accent} fillOpacity="0.22" />
            <circle cx="150" cy="145" r="52" fill={accent} />
            <circle cx="164" cy="138" r="48" fill={bg} />
            <circle
              cx="150"
              cy="145"
              r="88"
              stroke={secondary}
              strokeOpacity="0.35"
              strokeWidth="0.75"
              fill="none"
            />
          </g>
        );
      case 'horizon':
        return (
          <g>
            <circle cx="150" cy="148" r="56" fill={accent} fillOpacity="0.88" />
            <rect x="0" y="168" width="300" height="152" fill={bg} />
            <path
              d="M0 168 Q95 148 180 166 T300 162 L300 220 L0 220 Z"
              fill={secondary}
              fillOpacity="0.24"
            />
            <line
              x1="28"
              y1="168"
              x2="272"
              y2="168"
              stroke={accent}
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
          </g>
        );
      case 'orbit':
        return (
          <g>
            <ellipse
              cx="150"
              cy="145"
              rx="92"
              ry="30"
              transform="rotate(-24 150 145)"
              stroke={secondary}
              strokeWidth="1"
              strokeOpacity="0.55"
              fill="none"
            />
            <ellipse
              cx="150"
              cy="145"
              rx="68"
              ry="22"
              transform="rotate(28 150 145)"
              stroke={accent}
              strokeWidth="1.2"
              strokeOpacity="0.7"
              fill="none"
            />
            <circle cx="150" cy="145" r="24" fill={accent} />
            <circle cx="204" cy="112" r="5" fill={secondary} />
          </g>
        );
      case 'spiral':
        return (
          <g>
            <circle cx="150" cy="145" r="84" stroke={accent} strokeOpacity="0.28" strokeWidth="1" fill="none" />
            <circle cx="150" cy="145" r="64" stroke={secondary} strokeOpacity="0.38" strokeWidth="1" fill="none" />
            <circle cx="150" cy="145" r="44" stroke={accent} strokeOpacity="0.65" strokeWidth="1.2" fill="none" />
            <circle cx="150" cy="145" r="22" fill={accent} />
            <line x1="150" y1="45" x2="150" y2="245" stroke={secondary} strokeOpacity="0.2" strokeWidth="0.75" />
          </g>
        );
      case 'archway':
        return (
          <g>
            <path
              d="M84 235 L84 135 A66 66 0 0 1 216 135 L216 235 Z"
              fill={accent}
              fillOpacity="0.16"
              stroke={accent}
              strokeWidth="1.2"
            />
            <path
              d="M108 235 L108 140 A42 42 0 0 1 192 140 L192 235 Z"
              fill={secondary}
              fillOpacity="0.2"
            />
            <circle cx="150" cy="126" r="14" fill={accent} />
          </g>
        );
      case 'columns':
        return (
          <g>
            <rect x="64" y="68" width="22" height="162" fill={accent} fillOpacity="0.78" />
            <rect x="108" y="68" width="22" height="162" fill={secondary} fillOpacity="0.32" />
            <rect x="170" y="68" width="22" height="162" fill={secondary} fillOpacity="0.32" />
            <rect x="214" y="68" width="22" height="162" fill={accent} fillOpacity="0.78" />
            <line x1="48" y1="68" x2="252" y2="68" stroke={secondary} strokeWidth="2" strokeOpacity="0.7" />
            <line x1="48" y1="230" x2="252" y2="230" stroke={secondary} strokeWidth="2" strokeOpacity="0.7" />
          </g>
        );
      case 'monolith':
        return (
          <g>
            <rect
              x="118"
              y="62"
              width="64"
              height="172"
              fill={accent}
              fillOpacity="0.18"
              stroke={secondary}
              strokeWidth="1"
            />
            <rect x="132" y="76" width="36" height="144" fill={accent} fillOpacity="0.82" />
            <circle cx="150" cy="148" r="88" stroke={secondary} strokeOpacity="0.25" strokeWidth="0.75" fill="none" />
          </g>
        );
      case 'prism':
        return (
          <g>
            <polygon points="150,58 228,214 72,214" fill="none" stroke={accent} strokeWidth="1.5" />
            <polygon points="150,86 202,196 98,196" fill={accent} fillOpacity="0.2" />
            <line x1="40" y1="164" x2="260" y2="124" stroke={secondary} strokeWidth="1.5" strokeOpacity="0.75" />
          </g>
        );
      case 'peaks':
        return (
          <g>
            <polygon points="40,224 126,96 212,224" fill={secondary} fillOpacity="0.28" />
            <polygon points="110,224 188,118 264,224" fill={accent} fillOpacity="0.75" />
            <circle cx="212" cy="86" r="18" fill={secondary} fillOpacity="0.85" />
          </g>
        );
      case 'lantern':
        return (
          <g>
            <circle cx="150" cy="140" r="76" fill={accent} fillOpacity="0.16" />
            <circle cx="150" cy="140" r="46" fill={accent} fillOpacity="0.32" />
            <rect x="132" y="106" width="36" height="68" rx="4" fill={accent} />
            <line x1="150" y1="54" x2="150" y2="106" stroke={secondary} strokeWidth="1.2" />
          </g>
        );
      case 'waves':
        return (
          <g>
            <circle cx="150" cy="112" r="32" fill={secondary} fillOpacity="0.82" />
            <path d="M24 166 Q88 142 150 166 T276 166" fill="none" stroke={accent} strokeWidth="2" />
            <path d="M24 186 Q88 162 150 186 T276 186" fill="none" stroke={accent} strokeOpacity="0.65" strokeWidth="1.5" />
            <path
              d="M24 206 Q88 182 150 206 T276 206"
              fill="none"
              stroke={secondary}
              strokeOpacity="0.45"
              strokeWidth="1.2"
            />
          </g>
        );
      case 'compass':
      default:
        return (
          <g>
            <circle cx="150" cy="145" r="70" stroke={secondary} strokeOpacity="0.4" strokeWidth="1" fill="none" />
            <polygon points="150,68 164,145 150,222 136,145" fill={accent} fillOpacity="0.85" />
            <polygon points="72,145 150,131 228,145 150,159" fill={secondary} fillOpacity="0.45" />
            <circle cx="150" cy="145" r="8" fill={bg} stroke={accent} strokeWidth="2" />
          </g>
        );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none flex flex-col justify-between bg-[#111115]">
      <svg
        viewBox="0 0 300 340"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
            <stop offset="100%" stopColor={bg} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="45%" stopColor="#050507" stopOpacity="0" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="340" fill={bg} />
        <rect x="0" y="0" width="300" height="340" fill={`url(#${glowId})`} />
        {renderMotif()}
        <rect x="0" y="0" width="300" height="340" fill={`url(#${scrimId})`} />
        <rect
          x="12"
          y="12"
          width="276"
          height="316"
          fill="none"
          stroke={secondary}
          strokeOpacity="0.18"
          strokeWidth="0.75"
        />
      </svg>

      {/* Top Edition Kicker */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-300/85">
        <span>{movie.industry}</span>
        <span className="tabular-nums">{movie.year}</span>
      </div>

      {/* Bottom Title Typography */}
      <div className={`relative z-10 px-4 ${compact ? 'pb-4' : 'pb-5'}`}>
        <p className="text-[11px] font-medium tracking-wide text-zinc-300/85 mb-1 truncate">
          {movie.director}
        </p>
        <h3
          className={`font-display font-semibold leading-tight text-zinc-50 text-balance ${
            compact ? 'text-lg' : 'text-xl md:text-2xl'
          }`}
        >
          {movie.title}
        </h3>
      </div>
    </div>
  );
};
