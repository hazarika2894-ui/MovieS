import React from 'react';
import { Bookmark, BookmarkCheck, Star } from 'lucide-react';
import { Movie, WatchlistEntry } from '../types/cinema';
import { MoviePosterArt } from './MoviePosterArt';

interface MovieCardProps {
  movie: Movie;
  watchlistEntry?: WatchlistEntry;
  communityAverage: number | null;
  communityCount: number;
  userScore?: number | null;
  onOpenDetail: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
}

const STATUS_LABELS: Record<WatchlistEntry['status'], string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  watched: 'Watched',
};

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  watchlistEntry,
  communityAverage,
  communityCount,
  userScore,
  onOpenDetail,
  onToggleWatchlist,
}) => {
  const displayScore =
    communityAverage !== null
      ? ((movie.editorialScore + communityAverage) / 2).toFixed(1)
      : movie.editorialScore.toFixed(1);

  return (
    <article className="group flex flex-col bg-[#111115] border border-white/10 rounded-2xl overflow-hidden transition-colors duration-200 hover:border-white/25">
      {/* Poster Container */}
      <button
        type="button"
        onClick={() => onOpenDetail(movie)}
        aria-label={`View details for ${movie.title}`}
        className="relative aspect-[3/4] w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2B705]"
      >
        <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
          <MoviePosterArt movie={movie} />
        </div>
      </button>

      {/* Editorial Metadata Body */}
      <div className="flex flex-col flex-1 justify-between p-4 gap-3.5">
        <div className="space-y-2">
          {/* Unboxed Metadata Line with typographic dot separators */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-400">
            <span>{movie.language}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{movie.runtimeMinutes}m</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{movie.genres.slice(0, 2).join(', ')}</span>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {movie.synopsis}
          </p>
        </div>

        {/* Footer Action & Score Row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/8">
          <button
            type="button"
            onClick={() => onOpenDetail(movie)}
            className="flex items-center gap-1.5 text-xs text-zinc-200 hover:text-[#F2B705] transition-colors whitespace-nowrap"
          >
            <Star
              className="w-3.5 h-3.5 text-[#F2B705] fill-[#F2B705]"
              aria-hidden="true"
            />
            <span className="font-mono font-semibold tabular-nums">{displayScore}</span>
            {communityCount > 0 && (
              <span className="text-zinc-500 font-mono tabular-nums">
                ({communityCount})
              </span>
            )}
            {userScore && (
              <span className="text-[#F2B705] font-mono tabular-nums">
                · You {userScore}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] ${
              watchlistEntry
                ? 'bg-[#F2B705]/15 text-[#F2B705] border border-[#F2B705]/40 hover:bg-[#F2B705]/25'
                : 'bg-[#191920] text-zinc-200 border border-white/10 hover:border-white/25 hover:text-zinc-50'
            }`}
          >
            {watchlistEntry ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{STATUS_LABELS[watchlistEntry.status]}</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Watchlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
