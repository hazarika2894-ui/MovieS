import React, { useMemo, useState } from 'react';
import { Bookmark, Star, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  CinemaIndustry,
  Movie,
  UserRatingEntry,
  WatchlistEntry,
  WatchlistStatus,
} from '../types/cinema';
import { MoviePosterArt } from './MoviePosterArt';

interface WatchlistViewProps {
  user: User | null;
  movies: Movie[];
  watchlistMap: Record<string, WatchlistEntry>;
  ratingsByMovie: Record<string, UserRatingEntry[]>;
  onSignIn: () => void;
  onBrowseCatalog: () => void;
  onOpenDetail: (movie: Movie) => void;
  onUpdateStatus: (
    movie: Movie,
    status: WatchlistStatus,
    notes: string
  ) => Promise<void>;
  onRemoveWatchlist: (movie: Movie) => Promise<void>;
}

const STATUS_TABS: { value: 'all' | WatchlistStatus; label: string }[] = [
  { value: 'all', label: 'All Saved' },
  { value: 'plan_to_watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' },
];

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  user,
  movies,
  watchlistMap,
  ratingsByMovie,
  onSignIn,
  onBrowseCatalog,
  onOpenDetail,
  onUpdateStatus,
  onRemoveWatchlist,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | WatchlistStatus>('all');
  const [industryFilter, setIndustryFilter] = useState<'All' | CinemaIndustry>('All');

  const savedItems = useMemo(() => {
    const movieLookup = new Map(movies.map((m) => [m.id, m]));
    return Object.values(watchlistMap)
      .map((entry) => {
        const movie = movieLookup.get(entry.movieId);
        return movie ? { entry, movie } : null;
      })
      .filter((pair): pair is { entry: WatchlistEntry; movie: Movie } => pair !== null)
      .sort((a, b) => {
        const tA = a.entry.updatedAt?.getTime() ?? 0;
        const tB = b.entry.updatedAt?.getTime() ?? 0;
        return tB - tA;
      });
  }, [movies, watchlistMap]);

  const counts = useMemo(() => {
    return {
      total: savedItems.length,
      plan_to_watch: savedItems.filter((i) => i.entry.status === 'plan_to_watch').length,
      watching: savedItems.filter((i) => i.entry.status === 'watching').length,
      watched: savedItems.filter((i) => i.entry.status === 'watched').length,
    };
  }, [savedItems]);

  const filteredItems = useMemo(() => {
    return savedItems.filter(({ entry, movie }) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (industryFilter !== 'All' && movie.industry !== industryFilter) return false;
      return true;
    });
  }, [savedItems, statusFilter, industryFilter]);

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl py-16 px-4 text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#13131A] border border-white/10 flex items-center justify-center text-[#F2B705]">
          <Bookmark className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-50 text-balance">
            Your Personalized Cinema Watchlist
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Sign in with Google to save films across Hollywood, Bollywood, and South Cinema, track your viewing status, and keep personal notes synced across every device.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="px-6 py-3 rounded-xl bg-[#F2B705] text-[#070709] text-sm font-semibold hover:bg-[#f7c52b] transition-colors whitespace-nowrap"
          >
            Sign In with Google
          </button>
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="px-6 py-3 rounded-xl bg-[#14141B] border border-white/12 text-zinc-200 text-sm font-medium hover:border-white/30 transition-colors whitespace-nowrap"
          >
            Browse Film Catalog
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 py-8">
      {/* Header & Summary Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#F2B705] tracking-wide">
            Personal Archive
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-50 text-balance">
            {user.displayName ? `${user.displayName}'s Watchlist` : 'My Watchlist'}
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-4 sm:gap-8">
          <div>
            <span className="block text-xs text-zinc-400">Saved</span>
            <span className="font-mono text-2xl font-semibold text-zinc-50 tabular-nums">
              {counts.total}
            </span>
          </div>
          <div>
            <span className="block text-xs text-zinc-400">Planned</span>
            <span className="font-mono text-2xl font-semibold text-zinc-200 tabular-nums">
              {counts.plan_to_watch}
            </span>
          </div>
          <div>
            <span className="block text-xs text-zinc-400">Watching</span>
            <span className="font-mono text-2xl font-semibold text-[#F2B705] tabular-nums">
              {counts.watching}
            </span>
          </div>
          <div>
            <span className="block text-xs text-zinc-400">Watched</span>
            <span className="font-mono text-2xl font-semibold text-emerald-400 tabular-nums">
              {counts.watched}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter watchlist by viewing status"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#111116] border border-white/10 rounded-xl"
        >
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#F2B705] text-[#070709]'
                    : 'text-zinc-300 hover:text-zinc-50 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Cinema</span>
          <select
            value={industryFilter}
            onChange={(e) =>
              setIndustryFilter(e.target.value as 'All' | CinemaIndustry)
            }
            className="h-9 px-3 bg-[#111116] border border-white/10 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#F2B705]"
          >
            <option value="All">All Cinema</option>
            <option value="Hollywood">Hollywood</option>
            <option value="Bollywood">Bollywood</option>
            <option value="South Cinema">South Cinema</option>
          </select>
        </label>
      </div>

      {/* Watchlist Items */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center border border-white/10 rounded-2xl bg-[#0D0D12] space-y-4">
          <p className="text-sm text-zinc-300">
            {savedItems.length === 0
              ? 'Your watchlist is empty. Start saving acclaimed films from the catalog.'
              : 'No saved films match the current watchlist filter.'}
          </p>
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="px-5 py-2.5 rounded-xl bg-[#F2B705] text-[#070709] text-xs font-semibold hover:bg-[#f7c52b] transition-colors"
          >
            Explore Films
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map(({ entry, movie }) => {
            const ratings = ratingsByMovie[movie.id] ?? [];
            const myRating = ratings.find((r) => r.userId === user.uid);

            return (
              <article
                key={movie.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#111115] border border-white/10 hover:border-white/25 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpenDetail(movie)}
                  className="sm:w-32 aspect-[3/4] shrink-0 rounded-xl overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                >
                  <MoviePosterArt movie={movie} compact />
                </button>

                <div className="flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-zinc-400">
                        {movie.industry} · {movie.language} ·{' '}
                        <span className="font-mono tabular-nums">{movie.year}</span>
                      </span>
                      {myRating && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-[#F2B705] tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-[#F2B705]" aria-hidden="true" />
                          {myRating.score}.0
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenDetail(movie)}
                      className="text-left font-display text-xl font-semibold text-zinc-50 hover:text-[#F2B705] transition-colors"
                    >
                      {movie.title}
                    </button>

                    <p className="text-xs text-zinc-400">
                      Directed by {movie.director} ·{' '}
                      <span className="font-mono tabular-nums">{movie.runtimeMinutes}m</span>
                    </p>

                    {entry.notes && (
                      <p className="text-xs text-zinc-300 bg-[#17171E] border border-white/8 rounded-lg px-3 py-2 mt-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/8">
                    <select
                      aria-label={`Change status for ${movie.title}`}
                      value={entry.status}
                      onChange={(e) =>
                        onUpdateStatus(
                          movie,
                          e.target.value as WatchlistStatus,
                          entry.notes
                        )
                      }
                      className="h-9 px-3 rounded-lg bg-[#191922] border border-white/10 text-xs font-medium text-zinc-100 focus:outline-none focus:border-[#F2B705]"
                    >
                      <option value="plan_to_watch">Plan to Watch</option>
                      <option value="watching">Watching</option>
                      <option value="watched">Watched</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(movie)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-50 hover:bg-white/5 transition-colors"
                      >
                        Rate & Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveWatchlist(movie)}
                        aria-label={`Remove ${movie.title} from watchlist`}
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
