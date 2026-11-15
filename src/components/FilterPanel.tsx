import React, { useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { ALL_GENRES, ALL_LANGUAGES } from '../data/movies';
import {
  CinemaIndustry,
  CinemaLanguage,
  EraFilter,
  RuntimeFilter,
  SearchFilterState,
  SortOption,
} from '../types/cinema';

interface FilterPanelProps {
  filters: SearchFilterState;
  resultCount: number;
  totalCount: number;
  onChange: (next: SearchFilterState) => void;
  onReset: () => void;
}

const INDUSTRIES: ('All' | CinemaIndustry)[] = [
  'All',
  'Hollywood',
  'Bollywood',
  'South Cinema',
];

const ERAS: { value: EraFilter; label: string }[] = [
  { value: 'all', label: 'All Eras' },
  { value: '2020s', label: '2020s' },
  { value: '2010s', label: '2010s' },
  { value: '2000s', label: '2000s' },
  { value: 'classic', label: 'Classic (<2000)' },
];

const RUNTIMES: { value: RuntimeFilter; label: string }[] = [
  { value: 'all', label: 'Any Runtime' },
  { value: 'short', label: 'Under 130m' },
  { value: 'medium', label: '130–165m' },
  { value: 'epic', label: '165m+ Epic' },
];

const RATING_THRESHOLDS: { value: number; label: string }[] = [
  { value: 0, label: 'All Ratings' },
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4.7, label: '4.7+ Stars' },
  { value: 4.8, label: '4.8+ Stars' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  resultCount,
  totalCount,
  onChange,
  onReset,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.industry !== 'All' ||
    filters.language !== 'All' ||
    filters.genres.length > 0 ||
    filters.era !== 'all' ||
    filters.minRating > 0 ||
    filters.runtime !== 'all';

  const toggleGenre = (genre: string) => {
    const exists = filters.genres.includes(genre);
    const nextGenres = exists
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: nextGenres });
  };

  return (
    <section
      aria-label="Search and filter controls"
      className="border border-white/10 bg-[#0E0E13] rounded-2xl p-4 sm:p-6 space-y-5"
    >
      {/* Top Row: Search Bar + Industry Tabs + Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search by title, director, actor, or language..."
            aria-label="Search movies by title, director, actor, or language"
            className="w-full h-11 pl-10 pr-10 bg-[#15151C] border border-white/10 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#F2B705] transition-colors"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, query: '' })}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Industry Segmented Buttons */}
        <div
          role="group"
          aria-label="Filter by cinema industry"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#15151C] border border-white/10 rounded-xl"
        >
          {INDUSTRIES.map((ind) => {
            const active = filters.industry === ind;
            return (
              <button
                key={ind}
                type="button"
                onClick={() => onChange({ ...filters, industry: ind })}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] ${
                  active
                    ? 'bg-[#F2B705] text-[#070709]'
                    : 'text-zinc-300 hover:text-zinc-50 hover:bg-white/5'
                }`}
              >
                {ind === 'All' ? 'All Cinema' : ind}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-white/12 bg-[#15151C] text-xs font-semibold text-zinc-200 hover:border-white/25 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{advancedOpen ? 'Hide Filters' : 'More Filters'}</span>
        </button>
      </div>

      {/* Advanced Filters Drawer */}
      {advancedOpen && (
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Language Filter */}
            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-zinc-400">Language</span>
              <select
                value={filters.language}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    language: e.target.value as 'All' | CinemaLanguage,
                  })
                }
                className="w-full h-10 px-3 bg-[#15151C] border border-white/10 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-[#F2B705]"
              >
                <option value="All">All Languages</option>
                {ALL_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>

            {/* Era Filter */}
            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-zinc-400">Release Era</span>
              <select
                value={filters.era}
                onChange={(e) =>
                  onChange({ ...filters, era: e.target.value as EraFilter })
                }
                className="w-full h-10 px-3 bg-[#15151C] border border-white/10 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-[#F2B705]"
              >
                {ERAS.map((era) => (
                  <option key={era.value} value={era.value}>
                    {era.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Minimum Rating */}
            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-zinc-400">Minimum Score</span>
              <select
                value={filters.minRating}
                onChange={(e) =>
                  onChange({ ...filters, minRating: Number(e.target.value) })
                }
                className="w-full h-10 px-3 bg-[#15151C] border border-white/10 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-[#F2B705]"
              >
                {RATING_THRESHOLDS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Runtime Filter */}
            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-zinc-400">Runtime</span>
              <select
                value={filters.runtime}
                onChange={(e) =>
                  onChange({ ...filters, runtime: e.target.value as RuntimeFilter })
                }
                className="w-full h-10 px-3 bg-[#15151C] border border-white/10 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-[#F2B705]"
              >
                {RUNTIMES.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Genre Multi-Select Buttons */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-zinc-400">
              Genres (select one or more)
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => {
                const selected = filters.genres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    aria-pressed={selected}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] ${
                      selected
                        ? 'bg-[#F2B705]/15 border-[#F2B705] text-[#F2B705]'
                        : 'bg-[#15151C] border-white/10 text-zinc-300 hover:border-white/25 hover:text-zinc-100'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Summary & Sort Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="font-mono tabular-nums text-zinc-200">
            Showing {resultCount} of {totalCount} films
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F2B705] hover:underline whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-xs text-zinc-400">
          <span className="whitespace-nowrap">Sort by</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as SortOption })
            }
            className="h-9 px-3 bg-[#15151C] border border-white/10 rounded-lg text-xs font-medium text-zinc-100 focus:outline-none focus:border-[#F2B705]"
          >
            <option value="top_rated">Top Rated</option>
            <option value="community">Community Favorites</option>
            <option value="newest">Newest Releases</option>
            <option value="shortest">Shortest Runtime</option>
            <option value="title">Title (A–Z)</option>
          </select>
        </label>
      </div>
    </section>
  );
};
