import React from 'react';
import { ArrowDownRight, Film } from 'lucide-react';
import { CinemaIndustry } from '../types/cinema';
import heroProjectionImg from '../assets/images/hero_cinema_projection_1794753994268.jpg';
import hollywoodNoirImg from '../assets/images/spotlight_hollywood_noir_1794753994348.jpg';
import bollywoodEpicImg from '../assets/images/spotlight_bollywood_epic_1794753994814.jpg';
import southCinemaImg from '../assets/images/spotlight_south_cinema_1794753995439.jpg';

interface HeroSectionProps {
  totalFilms: number;
  watchlistCount: number;
  ratingsCount: number;
  onExploreCatalog: () => void;
  onOpenWatchlist: () => void;
  onSelectIndustry: (industry: CinemaIndustry) => void;
}

const INDUSTRY_SPOTLIGHTS: {
  industry: CinemaIndustry;
  subtitle: string;
  languages: string;
  image: string;
  alt: string;
}[] = [
  {
    industry: 'Hollywood',
    subtitle: 'Neo-Noir, Sci-Fi & Modern Classics',
    languages: 'English · 8 Curated Titles',
    image: hollywoodNoirImg,
    alt: 'Atmospheric Hollywood neo-noir rain-slicked city street still',
  },
  {
    industry: 'Bollywood',
    subtitle: 'Thrillers, Period Epics & Indie Voices',
    languages: 'Hindi · 8 Curated Titles',
    image: bollywoodEpicImg,
    alt: 'Lantern-lit Rajasthani sandstone palace courtyard still',
  },
  {
    industry: 'South Cinema',
    subtitle: 'Tamil, Telugu, Malayalam & Kannada',
    languages: '4 Regional Languages · 8 Curated Titles',
    image: southCinemaImg,
    alt: 'Misty South Indian stone temple beside emerald backwaters at dawn',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalFilms,
  watchlistCount,
  ratingsCount,
  onExploreCatalog,
  onOpenWatchlist,
  onSelectIndustry,
}) => {
  return (
    <section className="space-y-8 pt-6 pb-4">
      {/* Split-Screen Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between gap-8 py-4">
          <div className="space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#F2B705]">
              Curated World Cinema Archive
            </p>
            <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-semibold tracking-tight text-zinc-50 leading-[1.08] text-balance">
              Essential cinema from Hollywood, Bollywood, and South India.
            </h1>
            <p className="text-base text-zinc-300 max-w-2xl leading-relaxed">
              Discover acclaimed films across six languages, filter precisely by genre, runtime, or release era, publish your own star ratings, and curate a persistent personal watchlist.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="px-6 py-3 rounded-xl bg-[#F2B705] text-[#070709] text-sm font-semibold hover:bg-[#f7c52b] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
              >
                Explore Archive
              </button>
              <button
                type="button"
                onClick={onOpenWatchlist}
                className="px-6 py-3 rounded-xl bg-[#13131A] border border-white/15 text-zinc-100 text-sm font-medium hover:border-white/30 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
              >
                Open Watchlist
              </button>
            </div>

            {/* Clean Unboxed Metrics Row */}
            <div className="grid grid-cols-3 gap-6 pt-5 border-t border-white/10 max-w-lg">
              <div>
                <span className="block font-mono text-2xl font-semibold text-zinc-50 tabular-nums">
                  {totalFilms}
                </span>
                <span className="text-xs text-zinc-400">Curated Films</span>
              </div>
              <div>
                <span className="block font-mono text-2xl font-semibold text-zinc-50 tabular-nums">
                  {ratingsCount}
                </span>
                <span className="text-xs text-zinc-400">Member Ratings</span>
              </div>
              <div>
                <span className="block font-mono text-2xl font-semibold text-[#F2B705] tabular-nums">
                  {watchlistCount}
                </span>
                <span className="text-xs text-zinc-400">In Your Watchlist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Visual Container matching column height */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 bg-[#111115] min-h-[320px] lg:min-h-[420px]">
          <img
            src={heroProjectionImg}
            alt="Vintage cinema auditorium with glowing golden projection beam"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-zinc-300">Three Major Cinema Traditions</p>
              <p className="font-display text-lg font-medium text-zinc-50">
                English · Hindi · Tamil · Telugu · Malayalam · Kannada
              </p>
            </div>
            <Film className="w-5 h-5 text-[#F2B705] shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 3-Column Cinema Industry Spotlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INDUSTRY_SPOTLIGHTS.map((spot) => (
          <button
            key={spot.industry}
            type="button"
            onClick={() => onSelectIndustry(spot.industry)}
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#111115] text-left hover:border-[#F2B705]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
          >
            <img
              src={spot.image}
              alt={spot.alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[11px] text-zinc-300">{spot.languages}</p>
                <h2 className="font-display text-xl font-semibold text-zinc-50 group-hover:text-[#F2B705] transition-colors">
                  {spot.industry}
                </h2>
                <p className="text-xs text-zinc-300/90">{spot.subtitle}</p>
              </div>
              <ArrowDownRight
                className="w-4 h-4 text-zinc-300 group-hover:text-[#F2B705] shrink-0 transition-colors"
                aria-hidden="true"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
